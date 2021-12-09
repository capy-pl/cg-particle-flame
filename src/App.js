import React from 'react';
import * as Three from 'three';

import './App.css';

class App extends React.PureComponent {
  componentDidMount() {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new Three.WebGLRenderer();
    
    camera.position.set(0, 100, 0);
    camera.lookAt(0, 0, 0);
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.querySelector("#main").appendChild(renderer.domElement);

    const geometry = new Three.IcosahedronGeometry(20, 4);
    const material = new Three.MeshBasicMaterial( { color: 0xb7ff00, wireframe: true });
    const cube = new Three.Mesh( geometry, material );
    scene.add( cube );

    const animate = function () {
      requestAnimationFrame( animate );

      cube.rotation.z += 0.01;
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
