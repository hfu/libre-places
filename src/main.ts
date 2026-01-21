import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayerControl } from 'maplibre-gl-layer-control';
import 'maplibre-gl-layer-control/style.css';
import { LIGHT, layers } from '@protomaps/basemaps';

// Basemap source URL (Protomaps tiles via tunnel.optgeo.org)
const BASEMAP_SOURCE = 'https://tunnel.optgeo.org/martin/protomaps-basemap';

// Generate Protomaps Basemap light style
const lightStyle = {
  version: 8,
  sources: {
    protomaps: {
      type: 'vector',
      url: BASEMAP_SOURCE
    }
  },
  layers: layers('protomaps', LIGHT),
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
};

// Initialize MapLibre GL JS map with Protomaps Basemap light style
const map = new maplibregl.Map({
  container: 'map',
  style: lightStyle,
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
