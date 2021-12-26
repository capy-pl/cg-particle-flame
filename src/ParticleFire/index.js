import * as Three from 'three';

import FireBallVertexShader from './shaders/fireball.vert';
import FireBallFragmentShader from './shaders/fireball.frag';
import { ShaderMaterial } from 'three';

const defaultColor = {
  colDark: 0x000000,
  colNormal: 0xf7a90e,
  colLight: 0xede92a,
};

class FireParticle {
  geometry = new Three.BufferGeometry();
  particleNum = 500;
  time = 0;
  spawnParticleTime = 0;
  spawnParticleInterval = 1;
  particleSpreadingRatio = 1;

  constructor(particleNum) {
    this.particleNum = particleNum;
    this.positions = new Float32Array(particleNum * 3);
    this.colors = new Float32Array(particleNum * 3);
    this.size = new Float32Array(this.particleNum);
  
    this.material = new Three.ShaderMaterial({
      blending: Three.NormalBlending,
      depthTest: false,
      transparent: true,
    });

    this.needsUpdate = [];
    this.originalSizes = new Float32Array(particleNum);
    this.moveDest = new Float32Array(particleNum * 3);
    this.particleTime = new Float32Array(particleNum);

    for (let i = 0;i < particleNum; i++) {
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = 0;
      this.positions[i * 3 + 2] = 0;
      
      this.moveDest[i * 3] = Math.random() * 200 - 100;
      this.moveDest[i * 3 + 1] = Math.random() * 0.3 + 0.45;
      this.moveDest[i * 3 + 2] = Math.random() * 200 - 100;

      this.size[i] = Math.random() + 0.5;
      this.originalSizes[i] = this.size[i];
    }

    this.geometry.setAttribute('position', new Three.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('customColor', new Three.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new Three.BufferAttribute(this.size, 1));

    this.particleSystem = new Three.Points(this.geometry, this.material);
  }

  reset = () => {
    this.time = 0;
    this.spawnParticleTime = 0;
    this.spawnParticleInterval = 1;

    const sizes = this.geometry.attributes.size.array;
    const positions = this.geometry.attributes.position.array;

    for (let i = 0;i < this.particleNum; i++) {
      sizes[i] = 0;
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      this.needsUpdate[i] = false;
      this.particleTime[i] = 0;
    }

    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.position.needsUpdate = true;
  }

  spawnParticle = () => {
    for (let i = 0;i < this.particleNum; i++) {
      if (!this.needsUpdate[i]) {
        this.needsUpdate[i] = true;
        return;
      }
    }
  }

  update(elapsed) {
    this.spawnParticleTime += elapsed;
    if (this.spawnParticleTime > this.spawnParticleInterval) {
      this.spawnParticleTime = 0;
      this.spawnParticleInterval = Math.random() * 300 + 50;
      this.spawnParticle();
    }

    // convert to milliseconds
    elapsed /= 1000;
    this.time += elapsed;

    this.particleSystem.rotation.y += 0.01 * elapsed;
    let timeScale = 6;
    let sizes = this.geometry.attributes.size.array;
    let positions = this.geometry.attributes.position.array;
    let colors = this.geometry.attributes.customColor.array;

    for (let i = 0; i < this.particleNum; i++) {
      if (this.needsUpdate[i]) {
        if (this.particleTime[i] > 20000 / 1000) {
          positions[i * 3] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0;
          sizes[i] = 0.01;
        } else {
          let ac = this.particleSpreadingRatio * this.particleTime[i] / (20000 / 1000) + 
          0.01 * Math.sin(this.time);
          let dist = (10 * Math.sin(0.3 * i + this.time + Math.random() / 10)) * timeScale;
          sizes[i] = this.originalSizes[i] * (3 + Math.sin(0.4 * i + this.time));
          positions[i * 3] = ac * this.moveDest[i * 3] + dist;
          positions[i * 3 + 1] += (Math.random() * 0.4 + 0.9) * this.moveDest[i * 3 + 1] * timeScale;
          positions[i * 3 + 2] = ac * this.moveDest[i * 3 + 2] + dist;
          this.particleTime[i] += elapsed;
        }
      }
      colors[i * 3] = this.colors[0];
      colors[i * 3 + 1] = this.colors[1];
      colors[i * 3 + 2] = this.colors[2];
    }

    this.geometry.attributes.size.needsUpdate = true;
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.customColor.needsUpdate = true;
  }
}

class FireBall {
  constructor() {
    const uniforms = {
      colLight: {
        value: new Three.Color(defaultColor.colLight),
      },
      colNormal: {
        value: new Three.Color(defaultColor.colNormal),
      },
      colDark: {
        value: new Three.Color(defaultColor.colDark),
      },
      test: {
        type: 'f',
        value: 0.8,
      },
      time: {
        type: 'f',
        value: 0,
      }
    };

    const material = new ShaderMaterial({
      vertexShader: FireBallVertexShader,
      fragmentShader: FireBallFragmentShader,
      uniforms,
    });

    const mesh = new Three.Mesh(
      new  Three.IcosahedronBufferGeometry(20, 3),
      material,
    );

    this.mesh = mesh;
  }

  update(elapsed) {
    this.mesh.material.uniforms.time.value = elapsed;
  };
}

export {
  FireParticle,
  FireBall,
};
