/* eslint-disable react/prop-types */
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  FeatureGroup,
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

const HEX_RESOLUTION = 10;
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

function SensorLayer() {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    async function fetchSensorMarkers() {
      try {
        console.log("Fetching sensor data.");
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_IP}/data/sensor_sites`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const sites = await response.json();
        console.log("Fetched sensors: ", sites);
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

function PriorAnnotationsLayer({ hexagons }) {
  return (
    <>
      {hexagons.map((hex, idx) => (
        <Polygon
          key={idx}
          weight={1}
          fillOpacity={0.2}
          positions={hex.boundary}
          pathOptions={{
            color: hex.color,
            fillColor: hex.color,
            opacity: 0.2,
          }}
        />
      ))}
    </>
  );
}

function SelectionLayer({ hexagons }) {
  return (
    <>
      {hexagons.map((hex) => (
        <Polygon
          key={hex.id}
          weight={4}
          fillOpacity={0.2}
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

  const [priorAnnotations, setPriorAnnotations] = useState([]);

  const [multiSelectHexagons, setMultiSelectHexagons] = useState([]);
  const [isAdd, setIsAdd] = useState(false);

  const h3IDsToGeoBoundary = ({ hexagonsIDs, type }) => {
    if (!hexagonsIDs) {
      return [];
    }

    const color = context.annotationTypes[type];

    return hexagonsIDs.map((hexID) => ({
      id: hexID,
      boundary: h3.cellToBoundary(hexID, false).map(([lat, lng]) => [lat, lng]),
      color: color,
    }));
  };

  useEffect(() => {
    const currentHexIds = context.currentHexes;
    setSelectedHexagons(currentHexIds);
  }, [context.currentHexes]);

  useEffect(() => {
    const newHexagonsBoundaries = h3IDsToGeoBoundary({
      hexagonsIDs: selectedHexagons,
      type: context.currentNotes.type,
    });
    setHexagonsBoundaries(newHexagonsBoundaries);
  }, [selectedHexagons, context.currentNotes.type]);

  useEffect(() => {
    const hexs = context.priorAnnotations.flatMap((annotation) =>
      Object.keys(context.annotationTypes).length > 0
        ? h3IDsToGeoBoundary({
            hexagonsIDs: annotation.annotationHexes,
            type: annotation.type,
          })
        : []
    );
    setPriorAnnotations(hexs);
  }, [context.priorAnnotations, context.annotationTypes]);

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
    context.setCurrentHexes(newSelects);
  };

  useEffect(() => {
    if (isAdd) {
      const uniqueSet = new Set([...multiSelectHexagons, ...selectedHexagons]);
      const arr = Array.from(uniqueSet);
      setSelectedHexagons(arr);
      context.setCurrentHexes(arr);
    } else {
      const setHexagonIDs = new Set(multiSelectHexagons);
      const leftOver = selectedHexagons.filter((id) => !setHexagonIDs.has(id));
      setSelectedHexagons(leftOver);
      context.setCurrentHexes(leftOver);
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
        <LayersControl.Overlay checked name="Prior Annotations">
          <FeatureGroup>
            <PriorAnnotationsLayer hexagons={priorAnnotations} />
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
