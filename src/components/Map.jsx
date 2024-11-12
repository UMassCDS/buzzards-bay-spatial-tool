/* eslint-disable react/prop-types */
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  FeatureGroup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import * as h3 from "h3-js";
import { useEffect, useState, useContext } from "react";

window.type = true;

const HEX_RESOLUTION = 9;

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

const h3IDsToGeoBoundary = ({ hexagonsIDs }) => {
  if (!hexagonsIDs) {
    return [];
  }

  return hexagonsIDs.map((hexID) => ({
    id: hexID,
    boundary: h3.cellToBoundary(hexID, false).map(([lat, lng]) => [lat, lng]),
    color: "#4eaee4",
  }));
};

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
  const [selectedHexagons, setSelectedHexagons] = useState([]);
  const [hexagonsBoundaries, setHexagonsBoundaries] = useState([]);

  const [multiSelectHexagons, setMultiSelectHexagons] = useState([]);
  const [isAdd, setIsAdd] = useState(false);

  useEffect(() => {
    const newHexagonsBoundaries = h3IDsToGeoBoundary({
      hexagonsIDs: selectedHexagons,
    });
    setHexagonsBoundaries(newHexagonsBoundaries);
  }, [selectedHexagons]);

  const onAddSelectionHexagon = (hexagonID) => {
    const idx = selectedHexagons.indexOf(hexagonID);
    if (idx > -1) {
      const newSelects = [...selectedHexagons];
      newSelects.splice(idx, 1);
      setSelectedHexagons(newSelects);
    } else {
      setSelectedHexagons([...selectedHexagons, hexagonID]);
    }
  };

  useEffect(() => {
    if (isAdd) {
      const uniqueSet = new Set([...multiSelectHexagons, ...selectedHexagons]);
      const arr = Array.from(uniqueSet);
      // console.log(arr);
      setSelectedHexagons(arr);
    } else {
      const setHexagonIDs = new Set(multiSelectHexagons);
      const leftOver = selectedHexagons.filter((id) => !setHexagonIDs.has(id));
      // console.log(selectedHexagons);
      // console.log(setHexagonIDs);
      // console.log(leftOver);
      setSelectedHexagons(leftOver);
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

      // polygonCoords.map((latlng) =>
      //   hexagonIDs.push(h3.latLngToCell(latlng[0], latlng[1], HEX_RESOLUTION))
      // );

      // if (e.layerType === "polygon") {

      //   // const uniqueSet = new Set([...hexagonIDs, ...selectedHexagons]);
      //   // // console.log(uniqueSet);
      //   // const arr = Array.from(uniqueSet);
      //   // console.log(arr);
      //   // setSelectedHexagons(arr);
      // } else {
      //   const setHexagonIDs = new Set(hexagonIDs);
      //   const leftOver = selectedHexagons.filter(
      //     (id) => !setHexagonIDs.has(id)
      //   );
      //   console.log(selectedHexagons);
      //   console.log(setHexagonIDs);
      //   console.log(leftOver);
      //   setSelectedHexagons(leftOver);
      // }
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
