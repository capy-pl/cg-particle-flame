import React from 'react';
import * as Three from 'three';
import VolumetricFire from './VolumetricFire';
import OrbitControls from './OrbitContorls';
class App extends React.PureComponent {
  componentDidMount() {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new Three.WebGLRenderer({
      antialias: true,
    });

    const clock = new Three.Clock();

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
    
    const orbitControl = new OrbitControls(camera, document.querySelector("#main"));

    const fire = new VolumetricFire(2, 4, 2, 2, 0.5, camera);

    scene.add(fire.toMesh());

    const animate = () => {
      requestAnimationFrame( animate );
      const elapsed = clock.getElapsedTime();
      fire.update(elapsed); 
      orbitControl.update();
      renderer.render( scene, camera );
    };

    animate();

    window.onresize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  render() {
    return <div id="main">
    </div>
  }
}


export default App;
