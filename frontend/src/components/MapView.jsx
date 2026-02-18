import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_STYLES, MAP_CENTER, MAP_ZOOM } from '../config/mapConfig';
import { addFloodLayers } from '../utils/floodLayers';

export default function MapView({ mapStyle, showFloods, onMapLoad }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      addFloodLayers(map.current, showFloods);
      console.log('✅ Map loaded!');
      if (onMapLoad) onMapLoad(map.current);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Handle style changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.setStyle(MAP_STYLES[mapStyle].style);
    
    map.current.once('styledata', () => {
      addFloodLayers(map.current, showFloods);
    });
  }, [mapStyle, mapLoaded]);

  return <div ref={mapContainer} className="map-container" />;
}
