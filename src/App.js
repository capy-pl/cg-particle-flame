import React from 'react';
import * as Three from 'three';

import './App.css';

class App extends React.PureComponent {
  componentDidMount() {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new Three.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.querySelector("#main").appendChild(renderer.domElement);

    const geometry = new Three.BoxGeometry();
    const material = new Three.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new Three.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;

    const animate = function () {
      requestAnimationFrame( animate );

      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

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
