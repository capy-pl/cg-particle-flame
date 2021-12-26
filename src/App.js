import React from 'react';
import * as Three from 'three';
import VolumetricFire from './VolumetricFire';
import {
  FireParticle,
  FireBall
} from './ParticleFire';
import OrbitControls from './OrbitContorls';
import Grid from './Grid';

class App extends React.PureComponent {
  componentDidMount() {
    const scene = new Three.Scene();
    const camera = new Three.PerspectiveCamera(60, window.innerWidth / window.innerHeight, .1, 1000);
    const renderer = new Three.WebGLRenderer({
      antialias: true,
    });

    const clock = new Three.Clock();

    camera.position.set( 0, 0, 70);
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.querySelector("#main").appendChild(renderer.domElement);

    const orbitControl = new OrbitControls(camera, document.querySelector("#main"));
    const fireball = new FireBall();
    const fireparticle = new FireParticle(500);
    fireparticle.spawnParticle();
    // scene.add(fireball.mesh);
    scene.add(fireparticle.particleSystem);
    // const fire = new VolumetricFire(7, 10, 2, 0.5, camera);
    // fire.mesh.position.set( 0, 4 / 2, 0 );
    // scene.add(fire.mesh);

    const animate = () => {
      requestAnimationFrame(animate);
  
      const elapsed = clock.getElapsedTime();
      orbitControl.update();
      fireparticle.update(elapsed * 6);
      camera.lookAt( scene.position );
  
      // fire.update(elapsed);

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
