export default function ControlsStack({ 
  mapStyle, 
  onStyleChange, 
  showFloods, 
  onFloodsChange 
}) {
  return (
    <div className="controls-stack">
      <div className="control-card title-badge">
        <h3>🌦️ Rain or Shine</h3>
        <p>Auckland Flood Visualization</p>
      </div>

      <div className="control-card map-style-selector">
        <label>Map Style</label>
        <select value={mapStyle} onChange={onStyleChange}>
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
            onChange={onFloodsChange}
          />
          <span>Show Flood Zones</span>
        </label>
      </div>
    </div>
  );
}
