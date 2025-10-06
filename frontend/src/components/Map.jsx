/* eslint-disable react/prop-types */
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  FeatureGroup,
  useMapEvents,
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
import { ActionIcon } from "@mantine/core";
import { IconArrowsMove, IconHandFinger } from "@tabler/icons-react";

import { AnnotationsContext } from "../context/AnnotationsContext";

window.type = true;

const HEX_RESOLUTION = 10;

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
      label: "Evenly Spaced Nodes",
      type: "circle",
      radius: 6,
      color: "purple",
      fillColor: "purple",
      weight: 1,
    });
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

    return () => {
      legend.remove();
      style.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function EvenlySpacedNodesLayer() {
  const [layerGroup, setLayerGroup] = useState(null);

  useEffect(() => {
    async function fetchSensorSites() {
      try {
        // console.log("Fetching sensor data.");
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_IP}/data/sensor_sites`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const fetchedSites = await response.json();
        // console.log("Fetched evenly spaced nodes", fetchedSites);

        const canvasRenderer = L.canvas({ padding: 0.5 });
        const layer = L.layerGroup();

        fetchedSites.forEach((site) => {
          const marker = L.circleMarker([site.latitude, site.longitude], {
            renderer: canvasRenderer,
            radius: 7,
            fillColor: "purple",
            color: "purple",
            weight: 1,
            fillOpacity: 1,
          });
          marker.addTo(layer);
        });

        setLayerGroup(layer);
      } catch (error) {
        console.error("Error fetching sensor markers:", error);
      }
    }

    fetchSensorSites();
  }, []);

  useEffect(() => {
    if (layerGroup) {
      // react-leaflet LayersControl will handle add/remove
      return () => {
        layerGroup.clearLayers();
      };
    }
  }, [layerGroup]);

  return layerGroup ? (
    <LayersControl.Overlay name="Evenly Spaced Nodes">
      <FeatureGroup
        ref={(ref) => {
          if (ref && layerGroup) {
            layerGroup.eachLayer((layer) => {
              if (!ref.hasLayer(layer)) {
                ref.addLayer(layer);
              }
            });
          }
        }}
      />
    </LayersControl.Overlay>
  ) : null;
}

function PriorAnnotationsLayerByType({ hexagons }) {
  const [zoom, setZoom] = useState(11);
  const [canvasLayer, setCanvasLayer] = useState(null);
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
    },
  });

  // Use custom canvas layer for low zoom levels
  useEffect(() => {
    if (!map || zoom >= 10) {
      if (canvasLayer) {
        map.removeLayer(canvasLayer);
        setCanvasLayer(null);
      }
      return;
    }

    // Create custom canvas layer for better performance
    const CanvasLayer = L.Layer.extend({
      onAdd: function (map) {
        const canvas = L.DomUtil.create("canvas");
        const size = map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.style.position = "absolute";

        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");

        map.getPanes().overlayPane.appendChild(canvas);
        map.on("moveend", this._reset, this);
        this._reset();
      },

      onRemove: function (map) {
        map.getPanes().overlayPane.removeChild(this._canvas);
        map.off("moveend", this._reset, this);
      },

      _reset: function () {
        const topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._draw();
      },

      _draw: function () {
        const ctx = this._ctx;
        const size = this._map.getSize();
        ctx.clearRect(0, 0, size.x, size.y);

        // Aggressive sampling based on zoom
        const sampleRate = zoom < 8 ? 10 : zoom < 9 ? 5 : 3;

        for (let i = 0; i < hexagons.length; i += sampleRate) {
          const hex = hexagons[i];
          const center = hex.boundary
            .reduce(
              (acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]],
              [0, 0]
            )
            .map((v) => v / hex.boundary.length);

          const point = this._map.latLngToContainerPoint(center);

          // Draw small circles
          ctx.fillStyle = hex.color;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.arc(point.x, point.y, zoom < 8 ? 2 : 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      },
    });

    const layer = new CanvasLayer();
    map.addLayer(layer);
    setCanvasLayer(layer);

    return () => {
      if (layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    };
  }, [zoom, hexagons, map, canvasLayer]);

  // Only render actual polygons at high zoom
  if (zoom < 10) {
    return null;
  }

  // At medium zoom, reduce detail
  const simplifiedHexagons =
    zoom < 12 ? hexagons.filter((_, index) => index % 2 === 0) : hexagons;

  return (
    <>
      {simplifiedHexagons.map((hex) => (
        <Polygon
          key={hex.id}
          weight={2.5}
          fillOpacity={0.2}
          positions={hex.boundary}
          pathOptions={{
            color: hex.color,
            fillColor: hex.color,
            opacity: 0.6,
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
          fillOpacity={0.4}
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
      map.getContainer().style.cursor = "crosshair";
    } else {
      map.dragging.enable();
      map.getContainer().style.cursor = "";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHexagons, context.currentNotes.type, context.annotationTypes]);

  useEffect(() => {
    let priorsWithoutCurrent;
    if (context.viewingPriorAnnotation) {
      priorsWithoutCurrent = context.priorAnnotations.filter(
        (annotation) => annotation.index !== context.currentNotes.index
      );
    } else {
      priorsWithoutCurrent = context.priorAnnotations;
    }

    const hexs = priorsWithoutCurrent.flatMap((annotation) =>
      Object.keys(context.annotationTypes).length > 0
        ? h3IDsToGeoBoundary({
            hexagonsIDs: annotation.annotationHexes,
            type: annotation.type,
          })
        : []
    );
    setPriorAnnotations(hexs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <EvenlySpacedNodesLayer />
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
