# Animated Geo Lines with Three.js and Canvas

![animation gif](./animation.gif)

Project originally posted on [Twitter](https://twitter.com/dbabbs/status/1187743537963646979).

Techniques and source code for animating lines with a custom [Canvas](https://www.w3schools.com/html/html5_canvas.asp) and [Three.js](https://threejs.org/) layer on top of the [HERE JavaScript API](https://developer.here.com/documentation/maps/topics/quick-start.html).

There are three types of route lines that can generated. This can be configured in the `STATE` variable. The options are:
- `circle`: lines start at center and head towards the circumference of the circle with each point being an equal distance from each other
- `random`: lines are generated with random start and end points
- `randomSameStarting`: lines start at the same center but have random end points.

The routes are based off the real road network geometry and come from the [HERE Routing API](https://developer.here.com/documentation/routing/topics/what-is.html).

The animation code lives inside the `AnimationLayer.js` file.

**NOTE**: This app uses `Promise.allSettled()`, which is not yet implemented or supported by all browsers. The app will work fine with a recent version of Chrome.