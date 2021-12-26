import * as Three from 'three';

import PriorityQueue from '../PriorityQueue';

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
    this.texCorners = this.getTexCornerPositions();

    this._indexes = new Uint16Array((width + height + depth) * 30);
    this._position = new Float32Array((width + height + depth) * 30 * 3);
    this._texCoordinates = new Float32Array((width + height + depth) * 30 * 3);

    this.indexes = [];
    this.texCoordinates = [];
    this.points = [];

    this.toMesh();
  }

  getCornerPositions = () => {
    return [
      new Three.Vector3(-this.widthRadius, -this.heightRadius, -this.depthRadius),
      new Three.Vector3(this.widthRadius, -this.heightRadius, -this.depthRadius),
      new Three.Vector3(-this.widthRadius, this.heightRadius, -this.depthRadius),
      new Three.Vector3(this.widthRadius, this.heightRadius, -this.depthRadius),
      new Three.Vector3(-this.widthRadius, -this.heightRadius, this.depthRadius),
      new Three.Vector3(this.widthRadius, -this.heightRadius, this.depthRadius),
      new Three.Vector3(-this.widthRadius, this.heightRadius, this.depthRadius),
      new Three.Vector3(this.widthRadius, this.heightRadius, this.depthRadius),
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
    noiseprofile.wrapS = Three.RepeatWrapping;
    noiseprofile.wrapT = Three.RepeatWrapping;

    return {
      fireprofile,
      noiseprofile
    };
  }

  toMesh = () => {
          const {noiseprofile, fireprofile} = this.loadTextureProfiles();
          const uniforms = {
            "nzw" : {
              value : noiseprofile,
            },
            "fireProfile" : {
              value : fireprofile,
            },
            "time": {
              value : 1.0,
            }
          };
          
          this.material = new Three.RawShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader,
            side: Three.DoubleSide,
            blending: Three.AdditiveBlending,
            transparent: true,
          });

          this.geometry = new Three.BufferGeometry();
          this.geometry.setIndex(new Three.BufferAttribute(this._indexes, 1));
          this.geometry.setAttribute('position', new Three.BufferAttribute(this._position, 3));
          this.geometry.setAttribute('tex', new Three.BufferAttribute(this._texCoordinates, 3));
          this.geometry.dynamic = true;

          this.mesh = new Three.Mesh(this.geometry, this.material);
          this.mesh.updateMatrixWorld();
  }

  viewVector = () => {
    const modelViewMatrix = new Three.Matrix4();
    modelViewMatrix.multiplyMatrices(
      this.camera.matrixWorldInverse,
      this.mesh.matrixWorld,
    );

    const vec = new Three.Vector3();
    vec.set(
      -modelViewMatrix.elements[2],
      -modelViewMatrix.elements[6],
      -modelViewMatrix.elements[10]
    ).normalize();
    return vec;
  }

  update = (elapsed) => {
    this.mesh.updateMatrixWorld();
    this.slice();
    this.updateGeometry();
    this.mesh.material.uniforms.time.value = elapsed;
  }

  updateGeometry = () => {
    this.mesh.geometry.index.array.set(this.indexes);
    this.mesh.geometry.attributes.position.array.set(this.points);
    this.mesh.geometry.attributes.tex.array.set(this.texCoordinates);

    this.mesh.geometry.index.needsUpdate = true;
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.tex.needsUpdate = true;
  }

  slice = () => {
    this.points = [];
    this.texCoordinates = [];
    this.indexes = [];

    const cornerDistance = [];
    let maxCorner;
    let minDistance, maxDistance;

    const vc = this.viewVector();
  
    for (let i = 0; i < 8; i = (i + 1) | 0 ) {
      cornerDistance.push(this.posCorners[i].dot(vc))
    }

    minDistance = cornerDistance.reduce((prev, current) => {
      if (current < prev) return current;
      return prev;
    });
    maxDistance = cornerDistance.reduce((prev, current) => {
      if (current > prev) return current;
      return prev;
    });

    maxCorner = cornerDistance.indexOf(maxDistance);

    let sliceDistance = Math.floor(maxDistance / this.sliceSpacing) * this.sliceSpacing;

    const activeEdges = [];
    let firstEdge = 0, nextEdge = 0;
    const expirations = new PriorityQueue();

    const createEdge = (startIndex, endIndex) => {
      if (nextEdge >= 12) {
        return undefined;
      }

      const activeEdge = {
        expired: false,
        startIndex,
        endIndex,
        deltaPos: new Three.Vector3(),
        deltaTex: new Three.Vector3(),
        pos: new Three.Vector3(),
        tex: new Three.Vector3(),
        cur: nextEdge,
      };

      const range = cornerDistance[startIndex] - cornerDistance[endIndex];

      if (range !== 0.0) {
        let irange = 1.0 / range;
        activeEdge.deltaPos
          .subVectors(this.posCorners[endIndex], this.posCorners[startIndex])
          .multiplyScalar(irange);
        activeEdge.deltaTex
          .subVectors(this.texCorners[endIndex], this.texCorners[startIndex])
          .multiplyScalar(irange);

          const step = cornerDistance[startIndex] - sliceDistance;
          activeEdge.pos.addVectors(
            activeEdge.deltaPos.clone().multiplyScalar(step),
            this.posCorners[startIndex]
          );
          activeEdge.tex.addVectors(
            activeEdge.deltaTex.clone().multiplyScalar(step),
            this.texCorners[startIndex]
          );
          activeEdge.deltaPos.multiplyScalar(this.sliceSpacing);
          activeEdge.deltaTex.multiplyScalar(this.sliceSpacing);
      }
      expirations.push(activeEdge, cornerDistance[endIndex]);
      activeEdges[nextEdge++] = activeEdge;
      return activeEdge;
    }

    for (let i = 0;i < 3; i++){
      const activeEdge = createEdge(maxCorner, cornerNeighbors[maxCorner][i]);
      activeEdge.prev = (i + 2) % 3;
      activeEdge.next = (i + 1) % 3;
    }

    let nextIndex = 0;
    while (sliceDistance > minDistance) {
      while(expirations.top().priority >= sliceDistance) {
        const edge = expirations.pop().object;
        if (edge.expired) {
          continue;
        }
        if (
          edge.endIndex !== activeEdges[edge.prev].endIndex &&
          edge.endIndex !== activeEdges[edge.next].endIndex
        ) {

          edge.expired = true;

          const activeEdge1 = createEdge(edge.endIndex, incomingEdges[edge.endIndex][edge.startIndex]);
          activeEdge1.prev = edge.prev;
          activeEdges[edge.prev].next = nextEdge - 1;
          activeEdge1.next = nextEdge;

          const activeEdge2 = createEdge(edge.endIndex, incomingEdges[edge.endIndex][activeEdge1.endIndex]);
          activeEdge2.prev = nextEdge - 2;
          activeEdge2.next = edge.next;
          activeEdges[activeEdge2.next].prev = nextEdge - 1;
          firstEdge = nextEdge - 1;
        } else {
          let prev, next;

          if (edge.endIndex === activeEdges[edge.prev].endIndex) {
            prev = activeEdges[edge.prev];
            next = edge;
          } else {
            prev = edge;
            next = activeEdges[edge.next];
          }

          prev.expired = true;
          next.expired = true;

          const activeEdge = createEdge(edge.endIndex, incomingEdges[edge.endIndex][prev.startIndex]);
          activeEdge.prev = prev.prev;
          activeEdges[activeEdge.prev].next = nextEdge - 1;
          activeEdge.next = next.next;
          activeEdges[activeEdge.next].prev = nextEdge - 1;
          firstEdge = nextEdge - 1;
        }
      }

      let cur = firstEdge;
      let count = 0;
      do {
        count++;
        const activeEdge = activeEdges[cur];
        this.points.push(
          activeEdge.pos.x,
          activeEdge.pos.y,
          activeEdge.pos.z
        );
        this.texCoordinates.push(
          activeEdge.tex.x,
          activeEdge.tex.y,
          activeEdge.tex.z
        );
        activeEdge.pos.add(activeEdge.deltaPos);
        activeEdge.tex.add(activeEdge.deltaTex);
        cur = activeEdge.next;
      } while (cur !== firstEdge);

      for (let i = 2;i < count; i = (i + 1) | 0) {
        this.indexes.push(
          nextIndex,
          nextIndex + i - 1,
          nextIndex + i
        );
      }

      nextIndex += count;
      sliceDistance -= this.sliceSpacing;
    }
   }
}
