import * as Three from 'three';


import vertexShader from './shaders/fire.vert';
import fragmentShader from './shaders/fire.frag';

export default class Fire {
  constructor(width, height, depth) {
    const fireTex = new Three.TextureLoader().load(`${process.env.PUBLIC_URL}/firetex.png`);
    fireTex.magFilter = Three.LinearFilter;
    fireTex.minFilter = Three.LinearFilter;

    const uniforms = {
      fireTex : {
        value : fireTex,
      },
      noiseScale: {
        value: new Three.Vector4(1, 2, 1, 0.5),
      },
      magnitude: {
        value: 1.3,
      },
      lacunarity: {
        value: 2.0,
      },
      gain: {
        value: 0.5,
      },
      color: {
        value: new Three.Color(0xeeeeee),
      },
      invModelMatrix: {
        value: new Three.Matrix4(),
      },
      scale : {
        value: new Three.Vector3(1, 1, 1),
      },
      time: {
        value: 0,
      },
      seed : {
        value: Math.random() * 19.19
      },
      width: {
        value: width,
      },
      height: {
        value : height,
      },
      depth: {
        value: depth,
      }
    };

    this.material = new Three.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthTest: false,
      transparent: true,
      depthWrite: false,
    });

    this.wmaterial = new Three.MeshBasicMaterial({
      color: 0x3f7b9d,
      wireframe: true,
      depthTest: false,
      transparent: true,
      depthWrite: false,
    });

    this.scale = new Three.Vector3(1, 1, 1);
    this.geometry = new Three.BoxGeometry(width, height, depth);
    this.mesh = new Three.Mesh(this.geometry, this.material);
    this.wireframe = new Three.Mesh(this.geometry, this.wmaterial)
  }

  update(time) {
    this.mesh.updateMatrixWorld();
    const invModelMatrix = this.mesh.matrixWorld.clone();
    invModelMatrix.invert();

    if (time) {
      this.material.uniforms.time.value = time;
      this.material.uniforms.time.needsUpdate = true;
    }

    this.material.uniforms.invModelMatrix.value = invModelMatrix;
    this.material.uniforms.invModelMatrix.needsUpdate = true;

    this.material.uniforms.scale.value = this.scale;
    this.material.uniforms.scale.needsUpdate = true;
  }
}