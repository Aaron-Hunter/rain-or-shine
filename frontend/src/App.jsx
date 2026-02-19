import { useState } from 'react';
import MapView from './components/MapView';
import SearchBar from './components/SearchBar';
import ControlsStack from './components/ControlsStack';
import { updateFloodVisibility } from './utils/floodLayers';
import { API_URL } from './config/mapConfig';
import './index.css';

function App() {
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFloods, setShowFloods] = useState(true);
  const [mapStyle, setMapStyle] = useState(() => {
    const saved = localStorage.getItem('mapStyle');
    return saved || 'osm';
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !map) return;

    try {
      const resp = await fetch(`${API_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: searchQuery })
      });
      const data = await resp.json();
      if (data.lng && data.lat) {
        map.flyTo({ center: [data.lng, data.lat], zoom: 18 });
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const handleStyleChange = (e) => {
    const newStyle = e.target.value;
    setMapStyle(newStyle);
    localStorage.setItem('mapStyle', newStyle);
  };

  const handleFloodsChange = (e) => {
    const checked = e.target.checked;
    setShowFloods(checked);
    if (map) {
      updateFloodVisibility(map, checked);
    }
  };

  return (
    <div className="app-container">
      <MapView 
        mapStyle={mapStyle}
        showFloods={showFloods}
        onMapLoad={setMap}
      />
      
      <SearchBar
        onSubmit={handleSearch}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <ControlsStack
        mapStyle={mapStyle}
        onStyleChange={handleStyleChange}
        showFloods={showFloods}
        onFloodsChange={handleFloodsChange}
      />
    </div>
  );
}

export default App;
