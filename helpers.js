import { router } from './app.js';

function getRandom(min, max) {
   return Math.random() * (max - min) + min;
}

const requestRouteShape = (start, end) => {
   const params = {
      'mode': 'fastest;car',
      'waypoint0': `geo!${start.lat},${start.lng}`,
      'waypoint1': `geo!${end.lat},${end.lng}`,
      'representation': 'display'
   };
   return new Promise((resolve, reject) => {
      router.calculateRoute(
         params,
         res => {
            const shape = res.response.route[0].shape.map(x => x.split(',').map(x => Number(x)))
            resolve( shape )
         },
         err => reject(err)
      );
   })
}

export { getRandom, requestRouteShape }