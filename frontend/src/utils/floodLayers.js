import { TILE_SERVER_URL } from '../config/mapConfig';

export const addFloodLayers = (map, showFloods = true) => {
  if (!map) return;

  map.addSource("flood_plains", {
    type: "vector",
    url: `${TILE_SERVER_URL}/data/flood_plains.json`
  });

  map.addLayer({
    id: "flood-fill",
    type: "fill",
    source: "flood_plains",
    "source-layer": "WEEKLY__Saturday__Flood_Plains",
    paint: {
      "fill-color": "#0066ff",
      "fill-opacity": showFloods ? 0.35 : 0
    }
  });

  map.addSource("overland_flow", {
    type: "vector",
    url: `${TILE_SERVER_URL}/data/overland_flow.json`
  });

  map.addLayer({
    id: "overland-flow",
    type: "line",
    source: "overland_flow",
    "source-layer": "Overland_Flow_Paths",
    paint: {
      "line-color": "#0077ff",
      "line-width": 2,
      "line-opacity": showFloods ? 0.6 : 0
    }
  });
};

export const updateFloodVisibility = (map, showFloods) => {
  if (!map) return;

  const opacity = showFloods ? 0.35 : 0;
  const lineOpacity = showFloods ? 0.6 : 0;

  map.setPaintProperty('flood-fill', 'fill-opacity', opacity);
  map.setPaintProperty('overland-flow', 'line-opacity', lineOpacity);
};
