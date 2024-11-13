/* eslint-disable react/prop-types */
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  FeatureGroup,
  useMap,
  Popup,
  useMapEvents,
  Marker,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../styles/Map.css";
import L from "leaflet";
import * as h3 from "h3-js";
import { useEffect, useState, useContext } from "react";

import { RedColorGradient } from "../util/ColorPicker.js";
import { AnnotationsContext } from "../context/AnnotationsContext";

window.type = true;

const HEX_RESOLUTION = 9;
const SENSOR_DATA_PATH = "../../data/example_sites/sites.json";

L.drawLocal.draw.toolbar.buttons.rectangle = "REMOVE annotation hexagons";
L.drawLocal.draw.handlers.rectangle.tooltip.start =
  "Click and drag to select an area for REMOVING annotation hexagons";
L.drawLocal.draw.toolbar.buttons.polygon = "ADD annotation hexagons";
L.drawLocal.draw.handlers.polygon.tooltip.start =
  "Click to start drawing a shape for ADDING annotation hexagons";
L.drawLocal.draw.handlers.polygon.tooltip.cont =
  "Continue drawing the shape for ADDING annotation hexagons";
L.drawLocal.draw.handlers.polygon.tooltip.end =
  "Click the first point to finish drawing and fill the shape with hexagons";

const getTypeColor = (type) => {
  switch (type) {
    case "Area of Interest":
      return "#4eaee4"; // blue
    case "Suggested Sensor Location":
      return "#28a745"; // green
    case "Comment on existing sensor location":
      return "#ffc107"; // yellow
    default:
      return "#4eaee4"; // blue
  }
};

const h3IDsToGeoBoundary = ({ hexagonsIDs, type }) => {
  if (!hexagonsIDs) {
    return [];
  }

  const color = getTypeColor(type);

  return hexagonsIDs.map((hexID) => ({
    id: hexID,
    boundary: h3.cellToBoundary(hexID, false).map(([lat, lng]) => [lat, lng]),
    color: color,
  }));
};

function SensorLayer() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    async function fetchSensorMarkers() {
      try {
        const response = await fetch(SENSOR_DATA_PATH);
        const sites = await response.json();
        const siteMarkers = sites.map((site) => {
          const popupText =
            `SITE: ${site["site"]}\n` +
            `Description: ${site["description"]}\n` +
            `Tide Station: ${site["tide_station"]}\n` +
            `Ran1: ${site["ran1"]}\n` +
            `Ran2: ${site["ran2"]}`;

          const color = RedColorGradient(site["ran1"]);
          const customIcon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10],
          });

          return L.marker([site["latitude"], site["longitude"]], {
            icon: customIcon,
          }).bindPopup(popupText);
        });
        setMarkers(siteMarkers);
      } catch (error) {
        console.error("Error fetching sensor markers:", error);
      }
    }

    fetchSensorMarkers();
  }, []);

  return (
    <FeatureGroup>
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.getLatLng()}
          icon={marker.options.icon}
        >
          <Popup>{marker.getPopup().getContent()}</Popup>
        </Marker>
      ))}
    </FeatureGroup>
  );
}

function SelectionLayer({ hexagons }) {
  return (
    <>
      {hexagons.map((hex) => (
        <Polygon
          key={hex.id}
          positions={hex.boundary}
          pathOptions={{ color: hex.color, fillColor: hex.color }}
        />
      ))}
    </>
  );
}

const ClickHandler = ({ onAddSelectionHexagon }) => {
  useMapEvents({
    click: (e) => {
      const hexagonID = h3.latLngToCell(
        e.latlng.lat,
        e.latlng.lng,
        HEX_RESOLUTION
      );
      onAddSelectionHexagon(hexagonID);
    },
  });
  return null;
};

function Map() {
  const context = useContext(AnnotationsContext);
  const [selectedHexagons, setSelectedHexagons] = useState([]);
  const [hexagonsBoundaries, setHexagonsBoundaries] = useState([]);

  const [multiSelectHexagons, setMultiSelectHexagons] = useState([]);
  const [isAdd, setIsAdd] = useState(false);

  useEffect(() => {
    const currentHexIds = context.currentAnnotation.annotationHexes;
    setSelectedHexagons(currentHexIds);
  }, [context.currentAnnotation.annotationHexes]);

  useEffect(() => {
    const newHexagonsBoundaries = h3IDsToGeoBoundary({
      hexagonsIDs: selectedHexagons,
      type: context.currentAnnotation.type,
    });
    setHexagonsBoundaries(newHexagonsBoundaries);
  }, [selectedHexagons, context.currentAnnotation.type]);

  const onAddSelectionHexagon = (hexagonID) => {
    const idx = selectedHexagons.indexOf(hexagonID);
    let newSelects;
    if (idx > -1) {
      newSelects = [...selectedHexagons];
      newSelects.splice(idx, 1);
    } else {
      newSelects = [...selectedHexagons, hexagonID];
    }
    setSelectedHexagons(newSelects);
    context.updateCurrentAnnotationHexagons(newSelects);
  };

  useEffect(() => {
    if (isAdd) {
      const uniqueSet = new Set([...multiSelectHexagons, ...selectedHexagons]);
      const arr = Array.from(uniqueSet);
      setSelectedHexagons(arr);
      context.updateCurrentAnnotationHexagons(arr);
    } else {
      const setHexagonIDs = new Set(multiSelectHexagons);
      const leftOver = selectedHexagons.filter((id) => !setHexagonIDs.has(id));
      setSelectedHexagons(leftOver);
      context.updateCurrentAnnotationHexagons(leftOver);
    }
  }, [multiSelectHexagons]);

  const handleMultiSelect = (e) => {
    try {
      const layer = e.layer;
      const polygonCoords = layer
        .getLatLngs()[0]
        .map((latlng) => [latlng.lat, latlng.lng]);
      const hexagonIDs = h3.polygonToCells(polygonCoords, HEX_RESOLUTION);
      setMultiSelectHexagons(hexagonIDs);
      setIsAdd(e.layerType === "polygon");
    } catch (error) {
      console.error("Error occurred in multi-select: ", error);
    }

    e.layer.remove();
  };

  return (
    <MapContainer
      center={[41.7454, -70.6181]}
      zoom={11}
      style={{ height: "80vh", width: "100%", zIndex: 0 }}
    >
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="World Light Gray Base">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="World Imagery">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.arcgis.com/">ArcGIS</a>'
          />
        </LayersControl.BaseLayer>
        <LayersControl.Overlay checked name="Current Annotation">
          <FeatureGroup>
            <SelectionLayer hexagons={hexagonsBoundaries} />
          </FeatureGroup>
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Sensors Overlay">
          <SensorLayer />
        </LayersControl.Overlay>
      </LayersControl>
      <FeatureGroup>
        <EditControl
          position="topleft"
          onCreated={handleMultiSelect}
          draw={{
            rectangle: true,
            polygon: true,
            circle: false,
            polyline: false,
            marker: false,
            circlemarker: false,
          }}
          edit={{
            edit: false,
            remove: false,
          }}
        />
      </FeatureGroup>
      <ClickHandler onAddSelectionHexagon={onAddSelectionHexagon} />
    </MapContainer>
  );
}

export default Map;
