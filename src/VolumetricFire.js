import * as Three from 'three';

import vertexShader from './shaders/particle.vert'; 
import fragmentShader from './shaders/particle.frag';

const cornerNeighbors = [
  [ 1, 2, 4 ],
  [ 0, 5, 3 ],
  [ 0, 3, 6 ],
  [ 1, 7, 2 ],
  [ 0, 6, 5 ],
  [ 1, 4, 7 ],
  [ 2, 7, 4 ],
  [ 3, 5, 6 ],
];

const incomingEdges = [
  [ -1,  2,  4, -1,  1, -1, -1, -1 ],
  [  5, -1, -1,  0, -1,  3, -1, -1 ],
  [  3, -1, -1,  6, -1, -1,  0, -1 ],
  [ -1,  7,  1, -1, -1, -1, -1,  2 ],
  [  6, -1, -1, -1, -1,  0,  5, -1 ],
  [ -1,  4, -1, -1,  7, -1, -1,  1 ],
  [ -1, -1,  7, -1,  2, -1, -1,  4 ],
  [ -1, -1, -1,  5, -1,  6,  3, -1 ],
];

export default class VolumetricFire {
  constructor(width, height, depth, sliceSpacing, camera) {

    this.widthRadius = width * 0.5;
    this.heightRadius = height * 0.5;
    this.depthRadius = depth * 0.5;
    this.sliceSpacing = sliceSpacing;
    this.camera = camera;

    this.posCorners = this.getCornerPositions();
    this.textCorners = this.getTexCornerPositions();

    this.viewVector = new Three.Vector3();

    this.index = new Uint16Array((width + height + depth) * 30);
    this.position = new Float32Array((width + height + depth) * 30 * 3);
    this.tex = new Float32Array((width + height + depth) * 30 * 3);

    this.indexes = [];
    this.points = [];
    this.textCoordinates = [];
  }

  getCornerPositions = () => {
    return [
      new Three.Vector3(-this.widthRadius, -this.heightRadius, -this.depthRadius),
      new Three.Vector3(this.widthRadius, -this.heightRadius, -this.depthRadius),
      new Three.Vector3(-this.widthRadius, this.heightRadius, -this.depthRadius),
      new Three.Vector3(this.widthRadius, -this.heightRadius, -this.depthRadius),
      new Three.Vector3(-this.widthRadius, -this.heightRadius, this.depthRadius),
      new Three.Vector3(this.widthRadius, -this.heightRadius, this.depthRadius),
      new Three.Vector3(-this.widthRadius, this.heightRadius, this.depthRadius),
      new Three.Vector3(this.widthRadius, -this.heightRadius, this.depthRadius),
    ];
  }

  getTexCornerPositions = () => {
    return [
      new Three.Vector3(0, 0, 0),
      new Three.Vector3(1, 0, 0),
      new Three.Vector3(0, 1, 0),
      new Three.Vector3(1, 1, 0),
      new Three.Vector3(0, 0, 1),
      new Three.Vector3(1, 0, 1),
      new Three.Vector3(0, 1, 1),
      new Three.Vector3(1, 1, 1),
    ];
  }

  loadTextureProfile = (path) => {
      const textureLoader = new Three.TextureLoader();
      return textureLoader.load(path);
  }

  loadTextureProfiles = () => {
    const fireprofile = this.loadTextureProfile(`${process.env.PUBLIC_URL}/firetex.png`);
    const noiseprofile = this.loadTextureProfile(`${process.env.PUBLIC_URL}/nzw.png`);

    return {
      fireprofile,
      noiseprofile
    };
  }

  toMesh = () => {
          const {noiseprofile, fireprofile} = this.loadTextureProfiles();
          const uniforms = {
            "noiseprofile" : {
              type: 't',
              value : noiseprofile,
            },
            "fireprofile" : {
              type: 't',
              value : fireprofile,
            },
            "time": {
              value : 1.0,
            }
          };
          
          this.material = new Three.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            side: Three.DoubleSide,
            blending: Three.AdditiveBlending,
            transparent: true,
          });

          this.geometry = new Three.BufferGeometry();
          this.geometry.setIndex(new Three.BufferAttribute(this.index, 1));
          this.geometry.setAttribute('pos', new Three.BufferAttribute(this.position, 3));
          this.geometry.setAttribute('tex', new Three.BufferAttribute(this.tex, 3));
          
          this.mesh = new Three.Mesh(this.geometry, this.material);

          return this.mesh;
  }

  update = (elapsed) => {
    this.mesh.material.uniforms.value = elapsed;
  }

  updateGeometry = () => {
    this.mesh.geometry.index.array.set(this.index);
    this.mesh.geometry.attributes.pos.array.set(this.points);
    this.mesh.geometry.attributes.tex.array.set(this.textCoordinates);

    this.mesh.geometry.index.needsUpdate = true;
    this.mesh.geometry.attributes.pos.needsUpdate = true;
    this.mesh.geometry.attributes.text.needsUpdate = true;
  }

  slice = () => {
    this.points = [];
    this.textCoordinates = [];
    this.indexes = [];

    let i;
    const cornerDistance0 = this.posCorners[0];
  }

}
