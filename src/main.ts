import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayerControl } from 'maplibre-gl-layer-control';
import 'maplibre-gl-layer-control/style.css';
import { LIGHT, layers } from '@protomaps/basemaps';

// Basemap source URL (Protomaps tiles via tunnel.optgeo.org)
const BASEMAP_SOURCE = 'https://tunnel.optgeo.org/martin/protomaps-basemap';

// Terrain source URL (Mapterhorn Terrarium tiles)
const TERRAIN_SOURCE = 'https://tunnel.optgeo.org/martin/mapterhorn';

// Generate Protomaps Basemap light style
const lightStyle = {
  version: 8,
  sources: {
    protomaps: {
      type: 'vector',
      url: BASEMAP_SOURCE
    },
    terrainSource: {
      type: 'raster-dem',
      tiles: [`${TERRAIN_SOURCE}/{z}/{x}/{y}`],
      tileSize: 512,
      encoding: 'terrarium'
    }
  },
  layers: layers('protomaps', LIGHT),
  glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
  sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light'
};

// Initialize MapLibre GL JS map with Protomaps Basemap light style
const map = new maplibregl.Map({
  container: 'map',
  style: lightStyle,
  center: [106.816666, -6.200000],
  zoom: 12,
  hash: 'map' // Enable URL fragment state syncing
});

// Wait for style to load before adding controls and terrain
map.on('load', () => {
  // Enable terrain (3D elevation)
  map.setTerrain({
    source: 'terrainSource',
    exaggeration: 1.5
  });

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
