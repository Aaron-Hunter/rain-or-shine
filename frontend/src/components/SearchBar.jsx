import { useState } from 'react';

export default function SearchBar({
  onSubmit,
  value,
  onChange,
  mapStyle,
  onStyleChange,
  showFloods,
  onFloodsChange
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="search-shell">
      <form onSubmit={onSubmit} className="search-form">
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Search address..."
          className="search-input"
        />
        <button type="submit" className="search-button" aria-label="Search">
          🔍
        </button>
        <button
          type="button"
          className="settings-button"
          aria-label="Open settings"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((open) => !open)}
        >
          ⚙️
        </button>
      </form>

      <div className={`settings-panel ${settingsOpen ? 'open' : ''}`}>
        <div className="settings-title">
          <h3>🌦️ Rain or Shine</h3>
          <p>Auckland Flood Visualization</p>
        </div>

        <div className="settings-section">
          <label>Map Style</label>
          <select value={mapStyle} onChange={onStyleChange}>
            <option value="simple">Basic</option>
            <option value="osm">OpenStreetMap</option>
            <option value="satellite">Satellite</option>
            <option value="topographic">Topographic</option>
          </select>
        </div>

        <div className="settings-section toggle-section">
          <button
            type="button"
            className="toggle-button"
            onClick={() => onFloodsChange({ target: { checked: !showFloods } })}
            aria-pressed={showFloods}
          >
            {showFloods ? 'Hide Flood Zones' : 'Show Flood Zones'}
          </button>
        </div>
      </div>
    </div>
  );
}
