import { getRandom, requestRouteShape } from './helpers.js';
import AnimationLayer from './AnimationLayer.js';

const STATE = {
   flying: false,
   type: 'circle' // options: ['random', 'sameStarting', 'circle']
}

const CONFIG = {
   //Get your own API Key at developer.here.com
   apikey: 'EybNF4MkvcUj8WX1VJRKhT9dwDVz1wIHaKGF5tpqNss',
   numLines: 250,
   zoom: 6.5,
   position: {lat: 51.509865, lng: -0.118092},
   tilt: 45,
   bounds: {
      east: 17.765011384549428,
      north: 61.133499730210275,
      south: 47.74053628002839,
      west: -18.001195384326596,
   }
}

const platform = new H.service.Platform({ apikey: CONFIG.apikey });
const defaultLayers = platform.createDefaultLayers();
const map = new H.Map(
   document.querySelector(".map"),
   defaultLayers.vector.normal.map, {
   center: CONFIG.position,
   zoom: CONFIG.zoom,
   pixelRatio: window.devicePixelRatio || 1
});
map.getViewModel().setLookAtData({ tilt: CONFIG.tilt});

const router = platform.getRoutingService();
window.addEventListener('resize', () => map.getViewPort().resize());
const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
const provider = map.getBaseLayer().getProvider();
const style = new H.map.Style("./scene.yaml");
provider.setStyle(style);

function generateStartAndEndPoints() {
   const { bounds, position: center } = CONFIG;
   const lines = [];

   switch (STATE.type) {
      case 'sameStarting':
         for (let i = 0; i < CONFIG.numLines; i++) {
            lines.push({
               start: { lat: center.lat, lng: center.lng }, 
               end: { lat: getRandom(bounds.north, bounds.south), lng: getRandom(bounds.east, bounds.west) }
            })
         }
         break;
      case 'circle':
         const options = { steps: CONFIG.numLines, units: 'kilometers' };
         const circle = turf.circle([center.lng, center.lat], 300, options)
            .geometry.coordinates[0].map(x => [x[1], x[0]])
         for (let i = 0; i < CONFIG.numLines; i++) {
            lines.push({
               start: { lat: center.lat, lng: center.lng }, 
               end: { lat: circle[i][0], lng: circle[i][1] }
            })
         }
         break;
      case 'random':
         for (let i = 0; i < CONFIG.numLines; i++) {
            lines.push({
               start: { lat: getRandom(bounds.north, bounds.south), lng: getRandom(bounds.east, bounds.west) }, 
               end: { lat: getRandom(bounds.north, bounds.south), lng: getRandom(bounds.east, bounds.west) }
            })
         }
         break;
   }
   return lines;
}

async function calculateAndPlot() {
   const lines = generateStartAndEndPoints();
   const promises = lines.map(x => requestRouteShape(x.start, x.end));
   const routes = (await Promise.allSettled(promises))
      .filter(x => x.status === 'fulfilled')
      .map(x => x.value);
   rotateCamera();
   const max = Math.max(...routes.map(x => x.length));
   const canvasLayer = new AnimationLayer(map, routes, max);
   map.addLayer(canvasLayer);
}

async function rotateCamera() {
   const duration = 30000;
   flyTo({
      heading: map.getViewModel().getLookAtData().heading -= 30,
      zoom: map.getZoom() - 0.7,
      duration,
      tilt: 45
   });
   setInterval(() => {
      flyTo({
         heading: map.getViewModel().getLookAtData().heading += 30,
         zoom: map.getZoom() - 0.5,
         duration
      });
   }, duration)
}

function flyTo(options) {
   return new Promise(resolve => {
      if (!STATE.flying) {
         STATE.flying = true;
         map.getEngine().setAnimationDuration(options.duration);
         map.getViewModel().setLookAtData(options, true);
         setTimeout(() => {
            STATE.flying = false
            resolve();
         }, options.duration)
      } else {
         resolve();
      }
   })
}

calculateAndPlot();

export { router, STATE }