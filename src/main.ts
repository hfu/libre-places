import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayerControl } from 'maplibre-gl-layer-control';
import 'maplibre-gl-layer-control/style.css';

// Initialize MapLibre GL JS map with Protomaps Basemap
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://tunnel.optgeo.org/martin/protomaps-basemap',
  center: [106.816666, -6.200000],
  zoom: 12,
  hash: 'map' // Enable URL fragment state syncing
});

// Wait for style to load before adding controls
map.on('load', () => {
  // Add NavigationControl (zoom, compass)
  const navigationControl = new maplibregl.NavigationControl({
    visualizePitch: true
  });
  map.addControl(navigationControl, 'top-right');

  // Add ScaleControl (distance reference)
  const scaleControl = new maplibregl.ScaleControl({
    maxWidth: 200,
    unit: 'metric'
  });
  map.addControl(scaleControl, 'bottom-left');

  // Add LayersControl for layer toggling
  const layerControl = new LayerControl({
    compact: true,
    radioGroups: [] // No radio groups; all layers toggleable independently
  });
  map.addControl(layerControl, 'top-right');
});

// Export map for use in other modules
export { map };
