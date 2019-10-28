import { getRandom } from './helpers.js';

class AnimationLayer extends H.map.layer.CanvasLayer {
   constructor(map, routes, max) {
      super((gl, params) => this.renderScene(gl, params), { contextType: 'webgl' });

      const { x, y, z } = map.getEngine().geoToMeters(map.getCenter());
      this.origin = { x, y, z };

      this.camera = new THREE.Camera();
      this.scene = new THREE.Scene();
      this.animations = [];

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      this.scene.add(directionalLight);
      const light = new THREE.AmbientLight();
      this.scene.add(light);

      this.meters = [];
      this.projected = [];
      this.direction = 'up'
      this.max = max;


      for (let j = 0; j < routes.length; j++) {
         const route = routes[j];
         const vectors = [];
         const vectors2 = [];
         const vectors3 = [];
         for (let i = 0, len = route.length; i < len; i++) {
            const { x, y, z } = map.getEngine()
               .geoToMeters({lat: route[i][0], lng: route[i][1]});

            const two = map.getEngine()
               .geoToMeters({lat: route[i][0] + 0.005, lng: route[i][1] + 0.005});
            const twoX = two.x;
            const twoY = two.y;
            const twoZ = two.z;


            const three = map.getEngine()
               .geoToMeters({lat: route[i][0] + 0.01, lng: route[i][1] + 0.01});
            const threeX = three.x;
            const threeY = three.y;
            const threeZ = three.z;
      
            vectors.push(new THREE.Vector3(x - this.origin.x, y - this.origin.y, z - this.origin.z));
            vectors2.push(new THREE.Vector3(twoX - this.origin.x, twoY - this.origin.y, twoZ - this.origin.z) );

            vectors3.push(new THREE.Vector3(threeX - this.origin.x, threeY - this.origin.y, threeZ - this.origin.z));
         }

         const color = new THREE.Color(`hsl(${Math.floor(getRandom(180, 220))}, 100%, 50%)`);
         const material = new THREE.LineBasicMaterial({ color });

         const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
         geometry.setDrawRange(0, 0);

         const geometry2 = new THREE.BufferGeometry().setFromPoints(vectors2);
         geometry2.setDrawRange(0, 0);

         const geometry3 = new THREE.BufferGeometry().setFromPoints(vectors3);
         geometry3.setDrawRange(0, 0);

         const curveObject = new THREE.Line( geometry, material );
         this.scene.add(curveObject);

         const curveObject2 = new THREE.Line( geometry2, material );
         this.scene.add(curveObject2);

         const curveObject3 = new THREE.Line( geometry3, material );
         this.scene.add(curveObject3);

         this.projected.push(geometry);
         this.projected.push(geometry2);
         this.projected.push(geometry3)
      }

      this.drawRange = 0;
   }

   renderScene(gl, {size: {w, h}, cameraMatrix, pixelRatio}) {
      let renderer = this.renderer;
      let drawRange = this.drawRange;
      if (!renderer) {
         renderer = new THREE.WebGLRenderer({
            canvas: gl.canvas,
            context: gl,
            antialias: true
         });
         renderer.setPixelRatio(pixelRatio);
         this.renderer = renderer;
      }
      renderer.setSize(w / pixelRatio, h / pixelRatio);

      this.projected.forEach((el) => {
         el.setDrawRange(0, drawRange);
      });

      if (this.drawRange > this.max) {
         this.direction = 'down'
      } else if (this.drawRange < 0) {
         this.direction = 'up'
      }

      if (this.direction === 'up') {
         this.drawRange +=10;
      } else {
         this.drawRange -=10;
      }
   
      this.camera.projectionMatrix = new THREE.Matrix4().fromArray(cameraMatrix);

      this.camera.projectionMatrix = this.camera.projectionMatrix.multiply(new THREE.Matrix4()
         .makeTranslation(this.origin.x, this.origin.y, this.origin.z));

      renderer.state.reset();

      renderer.render(this.scene, this.camera);

      this.state = H.map.render.RenderState.ACTIVE;
      return this.state;
   }
}

export default AnimationLayer;