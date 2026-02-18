import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './index.css';

// Environment variables
const TILE_SERVER_URL = import.meta.env.VITE_TILE_SERVER_URL || 'http://localhost:8080';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';
const MAP_CENTER = [
  parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || 174.7633,
  parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || -36.8485
];
const MAP_ZOOM = parseInt(import.meta.env.VITE_MAP_ZOOM) || 16;

// Map style definitions
const MAP_STYLES = {
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

function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFloods, setShowFloods] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyle, setMapStyle] = useState(() => {
    const saved = localStorage.getItem('mapStyle');
    return saved || 'osm';
  });

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle].style,
      center: MAP_CENTER,
      zoom: MAP_ZOOM
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
      addFloodLayers();
      console.log('✅ Map loaded!');
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addFloodLayers = () => {
    if (!map.current) return;

    map.current.addSource("flood_plains", {
      type: "vector",
      url: `${TILE_SERVER_URL}/data/flood_plains.json`
    });

    map.current.addLayer({
      id: "flood-fill",
      type: "fill",
      source: "flood_plains",
      "source-layer": "WEEKLY__Saturday__Flood_Plains",
      paint: {
        "fill-color": "#0066ff",
        "fill-opacity": showFloods ? 0.35 : 0
      }
    });

    map.current.addSource("overland_flow", {
      type: "vector",
      url: `${TILE_SERVER_URL}/data/overland_flow.json`
    });

    map.current.addLayer({
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

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    
    const opacity = showFloods ? 0.35 : 0;
    const lineOpacity = showFloods ? 0.6 : 0;

    map.current.setPaintProperty('flood-fill', 'fill-opacity', opacity);
    map.current.setPaintProperty('overland-flow', 'line-opacity', lineOpacity);
  }, [showFloods, mapLoaded]);

  const handleStyleChange = (e) => {
    const newStyle = e.target.value;
    setMapStyle(newStyle);
    
    // Save to localStorage
    localStorage.setItem('mapStyle', newStyle);

    if (map.current) {
      map.current.setStyle(MAP_STYLES[newStyle].style);
      
      // Re-add flood layers after style changes
      map.current.once('styledata', () => {
        addFloodLayers();
      });
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !map.current) return;

    try {
      const resp = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: searchQuery })
      });
      const data = await resp.json();
      if (data.lng && data.lat) {
        map.current.flyTo({ center: [data.lng, data.lat], zoom: 18 });
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div className="app-container">
      <div ref={mapContainer} className="map-container" />
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search address..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          🔍
        </button>
      </form>

      <div className="controls-stack">
        <div className="control-card title-badge">
          <h3>🌦️ Rain or Shine</h3>
          <p>Auckland Flood Visualization</p>
        </div>

        <div className="control-card map-style-selector">
          <label>Map Style</label>
          <select value={mapStyle} onChange={handleStyleChange}>
            <option value="osm">OpenStreetMap</option>
            <option value="simple">Simple Light</option>
            <option value="satellite">Satellite</option>
          </select>
        </div>

        <div className="control-card flood-toggle">
          <label>
            <input
              type="checkbox"
              checked={showFloods}
              onChange={(e) => setShowFloods(e.target.checked)}
            />
            <span>Show Flood Zones</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default App;
