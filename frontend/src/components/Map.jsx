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
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "../styles/Map.css";
import L from "leaflet";
import "@gnatih/leaflet.legend";
import * as h3 from "h3-js";
import { useEffect, useState, useContext } from "react";
import { ActionIcon, Group, Text } from "@mantine/core";
import { IconArrowsMove, IconHandFinger } from "@tabler/icons-react";

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

// function BuildLegend() {
//   const context = useContext(AnnotationsContext);

//   const hexTypeSymbols = Object.keys(context.annotationTypes).map((type) => ({
//     label: type,
//     type: "polygon",
//     sides: 6,
//     color: context.annotationTypes[type],
//     fillColor: context.annotationTypes[type],
//     fillOpacity: 0.2,
//     weight: 2,
//   }));

//   const sensorSymbols = [];

//   if (context.sensorDataVisible) {
//     sensorSymbols.push({
//       label: "Sensor locations",
//       type: "circle",
//       radius: 6,
//       color: "purple",
//       fillColor: "purple",
//       weight: 1,
//     });
//   }

//   if (context.sensorLocationsVisible) {
//     sensorSymbols.push({
//       label: "Sensor Values",
//       type: "rectangle",
//       html: `<div style="width: 100px; height: 10px; background: linear-gradient(to right, ${RedColorGradient(
//         0
//       )}, ${RedColorGradient(1.0)});"></div>`,
//       weight: 1,
//     });
//   }

//   const map = useMap();
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.textContent = `
//         .leaflet-legend-title {
//           display: none;
//         }
//         .leaflet-legend-contents {
//           display: flex;
//           flex-direction: column; /* Changed to column for better layout */
//           gap: 5px;
//         }
//         .leaflet-legend-column {
//           flex: 1;
//         }
//         .leaflet-legend-item {
//           margin-bottom: 3px;
//           font-size: 10px;
//         }
//         .leaflet-legend-item div {
//           border: 1px solid black; /* Optional: Add border to the gradient bar */
//         }`;
//     document.head.appendChild(style);

//     const legend = L.control
//       .Legend({
//         position: "bottomright",
//         collapsed: false,
//         symbolWidth: 20,
//         opacity: 1,
//         column: 2,
//         legends: [...hexTypeSymbols, ...sensorSymbols],
//       })
//       .addTo(map);

//     return () => {
//       legend.remove();
//       style.remove();
//     };
//   }, []);

//   return null;
// }

function BuildLegend() {
  const context = useContext(AnnotationsContext);

  const hexTypeSymbols = Object.keys(context.annotationTypes).map((type) => ({
    label: type,
    type: "polygon",
    sides: 6,
    color: context.annotationTypes[type],
    fillColor: context.annotationTypes[type],
    fillOpacity: 0.2,
    weight: 2,
  }));

  const sensorSymbols = [];

  if (context.sensorDataVisible) {
    sensorSymbols.push({
      label: "Sensor locations",
      type: "circle",
      radius: 6,
      color: "purple",
      fillColor: "purple",
      weight: 1,
    });
  }

  if (context.sensorLocationsVisible) {
    sensorSymbols.push(
      ...[
        // {
        //   label: "Sensor with value [0]",
        //   type: "circle",
        //   radius: 6,
        //   color: "black",
        //   fillColor: RedColorGradient(0),
        //   fillOpacity: 1.0,
        //   weight: 1,
        // },
        // {
        //   label: "Sensor with value [0.33]",
        //   type: "circle",
        //   radius: 6,
        //   color: "black",
        //   fillColor: RedColorGradient(0.33),
        //   fillOpacity: 1.0,
        //   weight: 1,
        // },
        // {
        //   label: "Sensor with value [0.66]",
        //   type: "circle",
        //   radius: 6,
        //   color: "black",
        //   fillColor: RedColorGradient(0.66),
        //   fillOpacity: 1.0,
        //   weight: 1,
        // },
        // {
        //   label: "Sensor with value [0.25]",
        //   type: "circle",
        //   radius: 6,
        //   color: "black",
        //   fillColor: RedColorGradient(0.25),
        //   fillOpacity: 1.0,
        //   weight: 1,
        // },
        // {
        //   label: "Sensor with value [0.5]",
        //   type: "circle",
        //   radius: 6,
        //   color: "black",
        //   fillColor: RedColorGradient(0.5),
        //   fillOpacity: 1.0,
        //   weight: 1,
        // },
        // {
        //   label: "Sensor with value [0.75]",
        //   type: "circle",
        //   radius: 6,
        //   color: "black",
        //   fillColor: RedColorGradient(0.75),
        //   fillOpacity: 1.0,
        //   weight: 1,
        // },
        // {
        //   label: "Sensor with value [1.0]",
        //   type: "circle",
        //   radius: 6,
        //   color: "black",
        //   fillColor: RedColorGradient(1.0),
        //   fillOpacity: 1.0,
        //   weight: 1,
        // },
      ]
    );
  }

  const map = useMap();
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .leaflet-legend-title {
        display: none;
      }
      .leaflet-legend-contents {
        display: flex;
        flex-direction: row;
        gap: 5px;
        padding: 7px;
      }
      .leaflet-legend-column {
        flex: 1;
      }
      .leaflet-legend-item {
        margin-bottom: 3px;
        font-size: 10px;
      }`;
    document.head.appendChild(style);

    const legend = L.control
      .Legend({
        position: "bottomright",
        collapsed: false,
        symbolWidth: 20,
        opacity: 1,
        column: 1,
        legends: [...hexTypeSymbols, ...sensorSymbols],
      })
      .addTo(map);

    // Hacking :(
    const legend_html = document.querySelector(".leaflet-legend-contents");
    const column = legend_html.querySelector(".leaflet-legend-column");
    const gradient_div = document.createElement("div");
    gradient_div.className = "leaflet-legend-item";
    gradient_div.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 5px;">0</span>
        <div style="width: 100px; height: 10px; background: linear-gradient(to right, ${RedColorGradient(
          0
        )}, ${RedColorGradient(1.0)}); border: 1px solid black;"></div>
        <span style="margin-left: 5px;">1 | Sensor values</span>
      </div>`;
    column.appendChild(gradient_div);
    return () => {
      legend.remove();
      style.remove();
    };
  }, []);

  return null;
}

function SensorLayerNoValues() {
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
        console.log("Fetched sensors, for no value: ", sites);
        const siteMarkers = sites.map((site) => {
          const popupText =
            `SITE: ${site["site"]}\n` +
            `Description: ${site["description"]}\n` +
            `Tide Station: ${site["tide_station"]}`;

          const color = "purple";
          const customIcon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%;"></div>`,
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5],
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
          {marker.popupContent && <Popup>{marker.popupContent}</Popup>}
        </Marker>
      ))}
    </FeatureGroup>
  );
}

function SensorLayerWithValues() {
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
            html: `<div style="background-color: ${color}; width: 15px; height: 15px; border-radius: 50%;"></div>`,
            iconSize: [15, 15],
            iconAnchor: [7.5, 7.5],
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

function PriorAnnotationsLayerByType({ hexagons }) {
  return (
    <>
      {hexagons.map((hex) => (
        <Polygon
          key={hex.id}
          weight={1}
          fillOpacity={0.2}
          positions={hex.boundary}
          pathOptions={{ color: hex.color, fillColor: hex.color, opacity: 0.2 }}
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
  const context = useContext(AnnotationsContext);
  useMapEvents({
    click: (e) => {
      if (context.viewingPriorAnnotation && !context.editingAnnotation) {
        alert('Please click on "Edit" to edit the annotation.');
        return;
      }

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

const MapController = ({ mapMode }) => {
  const map = useMap();

  useEffect(() => {
    if (mapMode === "select") {
      map.dragging.disable();
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.dragging.enable();
      map.getContainer().style.cursor = '';
    }
  }, [map, mapMode]);

  return null;
};

function Map() {
  const context = useContext(AnnotationsContext);
  const [selectedHexagons, setSelectedHexagons] = useState([]);
  const [hexagonsBoundaries, setHexagonsBoundaries] = useState([]);

  const [priorAnnotations, setPriorAnnotations] = useState([]);

  const [multiSelectHexagons, setMultiSelectHexagons] = useState([]);
  const [isAdd, setIsAdd] = useState(false);
  const [mapMode, setMapMode] = useState("pan"); // "pan" or "select"

  const h3IDsToGeoBoundary = ({ hexagonsIDs, type }) => {
    if (!hexagonsIDs) {
      return [];
    }

    const color = context.annotationTypes[type];

    return hexagonsIDs.map((hexID) => ({
      id: hexID,
      boundary: h3.cellToBoundary(hexID, false).map(([lat, lng]) => [lat, lng]),
      color: color,
      type: type,
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
    // console.log(context.priorAnnotations);
    // console.log(context.currentNotes);
    let priorsWithoutCurrent;
    if (context.viewingPriorAnnotation) {
      priorsWithoutCurrent = context.priorAnnotations.filter(
        (annotation) => annotation.index !== context.currentNotes.index
      );
    } else {
      priorsWithoutCurrent = context.priorAnnotations;
    }

    // console.log(priorsWithoutCurrent);
    const hexs = priorsWithoutCurrent.flatMap((annotation) =>
      Object.keys(context.annotationTypes).length > 0
        ? h3IDsToGeoBoundary({
            hexagonsIDs: annotation.annotationHexes,
            type: annotation.type,
          })
        : []
    );
    setPriorAnnotations(hexs);
  }, [context.priorAnnotations, context.annotationTypes, context.currentNotes]);

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
    <div style={{ position: "relative" }}>
      {/* Mode Toggle Button */}
      <div
        style={{
          position: "absolute",
          top: "158px",
          left: "10px",
          zIndex: 99,
          backgroundColor: "white",
          borderRadius: "4px",
          border: "2px solid rgba(128, 128, 128, 0.5)",
          display: "flex",
          flexDirection: "column",
          width: "33px",
        }}
      >
        <ActionIcon
          variant={mapMode === "pan" ? "filled" : "light"}
          color={mapMode === "pan" ? "blue" : "gray"}
          size="lg"
          onClick={() => setMapMode("pan")}
          title="Pan Mode - Move the map around"
          style={{
            borderRadius: "2px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            width: "100%",
            height: "29px",
            minWidth: "29px",
            minHeight: "29px",
          }}
        >
          <IconArrowsMove size={16} />
        </ActionIcon>
        <ActionIcon
          variant={mapMode === "select" ? "filled" : "light"}
          color={mapMode === "select" ? "green" : "gray"}
          size="lg"
          onClick={() => setMapMode("select")}
          title="Select Mode - Click to add/remove hexagons"
          style={{
            borderRadius: "2px",
            width: "100%",
            height: "29px",
            minWidth: "29px",
            minHeight: "29px",
          }}
        >
          <IconHandFinger size={16} />
        </ActionIcon>
      </div>

      <MapContainer
        center={[41.7454, -70.6181]}
        zoom={11}
        style={{ height: "80vh", width: "100%", zIndex: 0 }}
      >
      <MapController mapMode={mapMode} />
      <BuildLegend />
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
        r
        {Object.keys(context.annotationTypes).map((type) => {
          const filteredHexagons = priorAnnotations.filter(
            (annotation) => annotation.type === type
          );
          return (
            <LayersControl.Overlay
              key={type}
              checked
              name={`${type} - Annotations`}
            >
              <FeatureGroup>
                <PriorAnnotationsLayerByType hexagons={filteredHexagons} />
              </FeatureGroup>
            </LayersControl.Overlay>
          );
        })}
        <LayersControl.Overlay name="Sensor Locations - No Values">
          <SensorLayerNoValues />
        </LayersControl.Overlay>
        <LayersControl.Overlay name="Sensor Locations - With Values ">
          <SensorLayerWithValues />
        </LayersControl.Overlay>
      </LayersControl>
      <FeatureGroup>
        {(!context.viewingPriorAnnotation || context.editingAnnotation) && (
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
        )}
      </FeatureGroup>
      {mapMode === "select" && (
        <ClickHandler onAddSelectionHexagon={onAddSelectionHexagon} />
      )}
    </MapContainer>
    </div>
  );
}

export default Map;
