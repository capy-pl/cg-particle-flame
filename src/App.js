import React from 'react';
import * as Three from 'three';
import VolumetricFire from './VolumetricFire';

class App extends React.PureComponent {
  componentDidMount() {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new Three.WebGLRenderer({
      antialias: true,
    });
    
    camera.position.set(100, 100, 50);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.querySelector("#main").appendChild(renderer.domElement);

    const material = new Three.LineBasicMaterial({
      color: 0x828282
    });
    
    for (let i = -50; i <= 50; i += 5) {
      const points = [];
      points.push(new Three.Vector3(i, 50, 0));
      points.push(new Three.Vector3(i, -50, 0));
      const geometry = new Three.BufferGeometry().setFromPoints( points );
      const line = new Three.Line( geometry, material );
      scene.add( line );
    }

    for (let i = -50; i <= 50; i += 5) {
      const points = [];
        points.push(new Three.Vector3(50, i, 0));
        points.push(new Three.Vector3(-50, i, 0));
        const geometry = new Three.BufferGeometry().setFromPoints( points );
        const line = new Three.Line( geometry, material );
        scene.add( line );
    }
    
    const fire = new VolumetricFire(2, 4, 2, 2, 0.5);

    fire
      .toMesh()
      .then((mesh) => {
        scene.add(mesh);
      });
  
    const animate = function () {
      requestAnimationFrame( animate );
      renderer.render( scene, camera );
    };

    animate();
  }

  render() {
    return <div id="main">
    </div>
  }
}


export default App;
