/* eslint-disable react/prop-types */
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  Polyline,
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
import { useEffect, useState, useContext, useMemo, useRef } from "react";
import { ActionIcon } from "@mantine/core";
import {
  IconArrowsMove,
  IconHandFinger,
  IconFocusCentered,
} from "@tabler/icons-react";

import { AnnotationsContext } from "../context/AnnotationsContext";
import REGIONS from "../config/regions";

window.type = true;

const HEX_RESOLUTION = 9;

// Individual hex outlines only render at this zoom or closer
const HEX_GRID_MIN_ZOOM = 15;
const HEX_GRID_MAX_CELLS = 2000;
// Max hexes added since the last full merge before re-merging the selection
const SELECTION_REMERGE_THRESHOLD = 300;
// Reject drawn selections above this many hexes (merge time grows past a few sec)
const MAX_SELECTION_CELLS = 200000;

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

  // Memoized so the legend isn't rebuilt on every map re-render
  const hexTypeSymbols = useMemo(
    () =>
      Object.keys(context.annotationTypes).map((type) => ({
        label: type,
        type: "polygon",
        sides: 6,
        color: context.annotationTypes[type],
        fillColor: context.annotationTypes[type],
        fillOpacity: 0.2,
        weight: 2,
      })),
    [context.annotationTypes]
  );

  const sensorSymbols = useMemo(() => {
    if (context.sensorDataVisible) {
      return [
        {
          label: "Evenly Spaced Nodes",
          type: "circle",
          radius: 6,
          color: "purple",
          fillColor: "purple",
          weight: 1,
        },
      ];
    }
    return [];
  }, [context.sensorDataVisible]);

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
  }, [map, hexTypeSymbols, sensorSymbols]);

  return null;
}

function EvenlySpacedNodesLayer() {
  const MIN_ZOOM_NODES = 10;
  const context = useContext(AnnotationsContext);

  const [canvasLayer, setCanvasLayer] = useState(null);
  const [zoom, setZoom] = useState(11);
  const [bounds, setBounds] = useState(null);
  const [layerEnabled, setLayerEnabled] = useState(false);
  const [sitesCache, setSitesCache] = useState(null); // Cache full dataset per region
  const map = useMap();

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
      setBounds(map.getBounds());
    },
    moveend: () => {
      setBounds(map.getBounds());
    },
    overlayadd: (e) => {
      if (e.name === "Evenly Spaced Nodes") {
        setLayerEnabled(true);
      }
    },
    overlayremove: (e) => {
      if (e.name === "Evenly Spaced Nodes") {
        setLayerEnabled(false);
      }
    },
  });

  // Fetch and cache sensor sites per region
  useEffect(() => {
    async function fetchSensorSites() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_IP}/data/sensor_sites?region=${context.selectedRegion}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const fetchedSites = await response.json();

        // Optimize: only store lat/lng, drop unnecessary fields to reduce memory
        const optimizedSites = fetchedSites.map((site) => ({
          lat: site.latitude,
          lng: site.longitude,
        }));

        setSitesCache(optimizedSites);
      } catch (error) {
        console.error("Error fetching sensor markers:", error);
      }
    }

    // Fetch only if we don't have data for this region yet
    if (layerEnabled && zoom >= MIN_ZOOM_NODES && !sitesCache) {
      fetchSensorSites();
    }

    // Clear cache when not needed
    if ((!layerEnabled || zoom < MIN_ZOOM_NODES) && sitesCache) {
      setSitesCache(null);
    }
  }, [layerEnabled, zoom, sitesCache, context.selectedRegion]);

  // Clear cache when region changes
  useEffect(() => {
    setSitesCache(null);
  }, [context.selectedRegion]);

  // Use canvas rendering for performance
  useEffect(() => {
    if (!sitesCache || !bounds || zoom < MIN_ZOOM_NODES || !layerEnabled) {
      // Clean up existing layer
      if (canvasLayer) {
        map.removeLayer(canvasLayer);
        setCanvasLayer(null);
      }
      return;
    }

    // Remove old layer if exists
    if (canvasLayer) {
      map.removeLayer(canvasLayer);
    }

    // Filter to visible sites only
    const visibleSites = sitesCache.filter((site) =>
      bounds.contains([site.lat, site.lng])
    );

    // Create custom canvas layer for maximum performance
    const CanvasLayer = L.Layer.extend({
      onAdd: function (map) {
        const canvas = L.DomUtil.create("canvas");
        const size = map.getSize();
        canvas.width = size.x;
        canvas.height = size.y;
        canvas.style.position = "absolute";
        canvas.style.pointerEvents = "none";

        this._canvas = canvas;
        this._ctx = canvas.getContext("2d");
        this._map = map;

        map.getPanes().overlayPane.appendChild(canvas);
        map.on("moveend", this._reset, this);
        map.on("zoomend", this._reset, this);
        this._reset();
      },

      onRemove: function (map) {
        if (this._canvas && this._canvas.parentNode) {
          map.getPanes().overlayPane.removeChild(this._canvas);
        }
        map.off("moveend", this._reset, this);
        map.off("zoomend", this._reset, this);
      },

      _reset: function () {
        const topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);

        const size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        this._draw();
      },

      _draw: function () {
        const ctx = this._ctx;
        const size = this._map.getSize();
        ctx.clearRect(0, 0, size.x, size.y);

        const currentZoom = this._map.getZoom();
        const radius = Math.max(
          2,
          Math.min(10, (currentZoom - MIN_ZOOM_NODES) * 1.8 + 2)
        );
        const currentBounds = this._map.getBounds();

        ctx.fillStyle = "purple";
        ctx.strokeStyle = "purple";
        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;

        visibleSites.forEach((site) => {
          if (currentBounds.contains([site.lat, site.lng])) {
            const point = this._map.latLngToContainerPoint([
              site.lat,
              site.lng,
            ]);
            ctx.beginPath();
            ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sitesCache, bounds, zoom, layerEnabled, map]);

  return (
    <LayersControl.Overlay name="Evenly Spaced Nodes">
      <FeatureGroup />
    </LayersControl.Overlay>
  );
}

// Filters by type in here so map clicks don't re-merge every annotation layer
function PriorAnnotationsLayerByType({ annotations, type }) {
  const hexagons = useMemo(
    () => annotations.filter((annotation) => annotation.type === type),
    [annotations, type]
  );
  const color = hexagons[0]?.color;
  const hexIds = useMemo(() => hexagons.map((hex) => hex.id), [hexagons]);
  const polygons = useMemo(() => mergedPolygonsFromHexes(hexIds), [hexIds]);

  return (
    <>
      {polygons.map((rings, index) => (
        <Polygon
          key={index}
          weight={2.5}
          fillOpacity={0.2}
          positions={rings}
          pathOptions={{
            color,
            fillColor: color,
            opacity: 0.6,
          }}
        />
      ))}
      <HexGridLayer hexIds={hexIds} color={color} />
    </>
  );
}

// Per-hex outlines at high zoom, culled to the viewport, drawn as one polyline
function HexGridLayer({ hexIds, color }) {
  const map = useMap();
  const [view, setView] = useState(() => ({
    zoom: map.getZoom(),
    bounds: map.getBounds(),
  }));

  useMapEvents({
    zoomend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds() }),
    moveend: () => setView({ zoom: map.getZoom(), bounds: map.getBounds() }),
  });

  const rings = useMemo(() => {
    if (view.zoom < HEX_GRID_MIN_ZOOM || hexIds.length === 0) {
      return [];
    }
    const bounds = view.bounds.pad(0.05);
    const visible = [];
    for (const id of hexIds) {
      if (visible.length >= HEX_GRID_MAX_CELLS) break;
      if (bounds.contains(h3.cellToLatLng(id))) {
        const boundary = h3.cellToBoundary(id, false);
        boundary.push(boundary[0]); // close the ring
        visible.push(boundary);
      }
    }
    return visible;
  }, [view, hexIds]);

  if (rings.length === 0) {
    return null;
  }

  return (
    <Polyline
      positions={rings}
      pathOptions={{ color, weight: 1, opacity: 0.8, interactive: false }}
    />
  );
}

// Exact merged outline of the hexes (no coarsening — must match the real cells)
function mergedPolygonsFromHexes(hexIds) {
  if (hexIds.length === 0) return [];
  try {
    return h3.cellsToMultiPolygon(hexIds, false);
  } catch (error) {
    console.error("Failed to merge hexes into polygons:", error);
    return [];
  }
}

// Keeps the last full merge as a base and merges only newly added hexes, so
// clicks don't re-merge the whole selection (slow for large areas)
function SelectionLayer({ hexIds, color }) {
  const baseRef = useRef({ idSet: new Set(), polygons: [] });

  const { basePolygons, addedPolygons } = useMemo(() => {
    const base = baseRef.current;

    let added = null;
    if (hexIds.length >= base.idSet.size) {
      added = [];
      for (const id of hexIds) {
        if (!base.idSet.has(id)) {
          added.push(id);
        }
      }
      const hasRemovals = hexIds.length - added.length < base.idSet.size;
      if (hasRemovals || added.length > SELECTION_REMERGE_THRESHOLD) {
        added = null;
      }
    }

    if (added === null) {
      baseRef.current = {
        idSet: new Set(hexIds),
        polygons: mergedPolygonsFromHexes(hexIds),
      };
      return { basePolygons: baseRef.current.polygons, addedPolygons: [] };
    }

    return {
      basePolygons: base.polygons,
      addedPolygons: mergedPolygonsFromHexes(added),
    };
  }, [hexIds]);

  return (
    <>
      {[...basePolygons, ...addedPolygons].map((rings, index) => (
        <Polygon
          key={index}
          weight={4}
          fillOpacity={0.4}
          positions={rings}
          pathOptions={{ color, fillColor: color }}
        />
      ))}
      <HexGridLayer hexIds={hexIds} color={color} />
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

const RegionController = () => {
  const context = useContext(AnnotationsContext);
  const map = useMap();

  useEffect(() => {
    const regionConfig = REGIONS[context.selectedRegion];
    if (regionConfig) {
      map.setView(regionConfig.center, regionConfig.zoom);
    }
  }, [context.selectedRegion, map]);

  return null;
};

function Map() {
  const context = useContext(AnnotationsContext);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedHexagons, setSelectedHexagons] = useState([]);

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
      color: color,
      type: type,
    }));
  };

  useEffect(() => {
    const currentHexIds = context.currentHexes;
    setSelectedHexagons(currentHexIds);
  }, [context.currentHexes]);

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
    // currentNotes.index (not currentNotes) so typing doesn't rebuild layers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    context.priorAnnotations,
    context.annotationTypes,
    context.viewingPriorAnnotation,
    context.currentNotes.index,
  ]);

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
      // estimate size at a coarser resolution (1 coarse cell ~ 343 res-10 cells)
      const estimatedCells =
        h3.polygonToCells(polygonCoords, HEX_RESOLUTION - 3).length * 343;
      if (estimatedCells > MAX_SELECTION_CELLS) {
        alert(
          "This area is too large to select at once. Please select a smaller area."
        );
        e.layer.remove();
        return;
      }
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
          top: "10px",
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

      {/* Reset view (temporary, for testing) */}
      <div
        style={{
          position: "absolute",
          bottom: "25px",
          left: "10px",
          zIndex: 99,
          backgroundColor: "white",
          borderRadius: "4px",
          border: "2px solid rgba(128, 128, 128, 0.5)",
          width: "33px",
        }}
      >
        <ActionIcon
          variant="light"
          color="gray"
          size="lg"
          onClick={() => {
            const regionConfig = REGIONS[context.selectedRegion];
            if (mapInstance && regionConfig) {
              mapInstance.setView(regionConfig.center, regionConfig.zoom);
            }
          }}
          title="Reset map view"
          style={{
            borderRadius: "2px",
            width: "100%",
            height: "29px",
            minWidth: "29px",
            minHeight: "29px",
          }}
        >
          <IconFocusCentered size={16} />
        </ActionIcon>
      </div>

      <MapContainer
        ref={setMapInstance}
        center={[41.7454, -70.6181]}
        zoom={11}
        style={{ height: "80vh", width: "100%", zIndex: 0 }}
        // Canvas rendering keeps large hex selections responsive
        preferCanvas={true}
      >
        <MapController mapMode={mapMode} />
        <RegionController />
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
              <SelectionLayer
                hexIds={selectedHexagons || []}
                color={context.annotationTypes[context.currentNotes.type]}
              />
            </FeatureGroup>
          </LayersControl.Overlay>
          {Object.keys(context.annotationTypes).map((type) => (
            <LayersControl.Overlay
              key={type}
              checked
              name={`${type} - Annotations`}
            >
              <FeatureGroup>
                <PriorAnnotationsLayerByType
                  annotations={priorAnnotations}
                  type={type}
                />
              </FeatureGroup>
            </LayersControl.Overlay>
          ))}
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
