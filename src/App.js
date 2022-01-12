import React from 'react';
import * as Three from 'three';
import Stat from 'stats.js';
import * as dat from 'dat.gui';

import { Particle } from './ParticleFire';
import {
  ParticleOptions
} from './ParticleFire/Particle';

import OrbitControls from './OrbitContorls';

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.options = {};
    for (let key in ParticleOptions) {
      this.options[key] = ParticleOptions[key].default;
    }
  }

  componentDidMount() {
    const gui = this.configGUI();

    gui.show();

    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1000);
    const renderer = new Three.WebGLRenderer({
      antialias: true,
    });

    const clock = new Three.Clock();
    clock.start();
    const stats = new Stat();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    camera.position.set(10, 2, 0);
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 0x0c0c0c
    renderer.setClearColor(0x0c0c0c, 1);
    document.querySelector("#main").appendChild(renderer.domElement);

    const orbitControl = new OrbitControls(camera, document.querySelector("#main"));
    const particleFire = new Particle();

    scene.add(particleFire.particleSystem);

    const animate = () => {
      stats.begin();
      const elapsed = clock.getElapsedTime();

      orbitControl.update();

      particleFire.bulkSetAttrs(this.options);
      particleFire.update(elapsed);
      camera.lookAt( particleFire.particleSystem.position );
  
      renderer.render( scene, camera );
      stats.end();
      requestAnimationFrame(animate);
    };

    animate();

    window.onresize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  configGUI = () => {
    const gui = new dat.GUI();
    for (let key in ParticleOptions) {
      if (key === 'color') {
        gui.addColor(this.options, key, ParticleOptions[key]);
      } else if (key === 'texture') {
        gui.add(this.options, key, ParticleOptions[key].options);
      }
      else {
        gui.add(this.options, key, ParticleOptions[key].min, ParticleOptions[key].max)
      }
    }
    return gui; 
  }

  render() {
    return <div id="main">
    </div>
  }
}


export default App;
