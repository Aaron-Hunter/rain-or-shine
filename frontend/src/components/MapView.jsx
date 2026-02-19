import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_STYLES, MAP_CENTER, MAP_ZOOM } from '../config/mapConfig';
import { addFloodLayers } from '../utils/floodLayers';

export default function MapView({ mapStyle, showFloods, onMapLoad }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load saved position or use defaults
  const getInitialPosition = () => {
    const saved = localStorage.getItem('mapPosition');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved map position');
      }
    }
    return {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: 0,
      bearing: 0
    };
  };

  useEffect(() => {
    if (map.current) return;

    const initialPosition = getInitialPosition();

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle].style,
      center: initialPosition.center,
      zoom: initialPosition.zoom,
      pitch: initialPosition.pitch,
      bearing: initialPosition.bearing
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
      addFloodLayers(map.current, showFloods);
      console.log('✅ Map loaded!');
      if (onMapLoad) onMapLoad(map.current);
    });

    // Save position whenever map moves
    const savePosition = () => {
      if (!map.current) return;
      
      const center = map.current.getCenter();
      const zoom = map.current.getZoom();
      const pitch = map.current.getPitch();
      const bearing = map.current.getBearing();

      localStorage.setItem('mapPosition', JSON.stringify({
        center: [center.lng, center.lat],
        zoom,
        pitch,
        bearing
      }));
    };

    // Save position on moveend (after user stops panning/zooming)
    map.current.on('moveend', savePosition);

    return () => {
      if (map.current) {
        map.current.off('moveend', savePosition);
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
