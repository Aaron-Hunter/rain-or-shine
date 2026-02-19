// Environment variables
export const TILE_SERVER_URL = import.meta.env.VITE_TILE_SERVER_URL || 'http://localhost:8080';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
export const MAP_CENTER = [
  parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || 174.7633,
  parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -36.8485
];
export const MAP_ZOOM = parseInt(import.meta.env.VITE_MAP_ZOOM) || 16;

// Map style definitions
export const MAP_STYLES = {
  osm: {
    name: "OpenStreetMap",
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap contributors"
        }
      },
      layers: [
        { id: "osm", type: "raster", source: "osm" }
      ]
    }
  },
  simple: {
    name: "Simple Light",
    style: {
      version: 8,
      sources: {
        carto: {
          type: "raster",
          tiles: ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap contributors, &copy; CARTO"
        }
      },
      layers: [
        { id: "carto", type: "raster", source: "carto" }
      ]
    }
  },
  satellite: {
    name: "Satellite",
    style: {
      version: 8,
      sources: {
        satellite: {
          type: "raster",
          tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community"
        }
      },
      layers: [
        { id: "satellite", type: "raster", source: "satellite" }
      ]
    }
  }
};
