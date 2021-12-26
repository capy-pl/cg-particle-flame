import * as Three from 'three';

export default class Grid extends Three.LineSegments {
  constructor() {
    const points = [];
    for (let i = -50; i <= 50; i += 5) {
      points.push(new Three.Vector3(i, 50, 0));
      points.push(new Three.Vector3(i, -50, 0));
    }

    for (let i = -50; i <= 50; i += 5) {
        points.push(new Three.Vector3(50, i, 0));
        points.push(new Three.Vector3(-50, i, 0));
    }

    const material = new Three.LineBasicMaterial({
      color: 0x828282
    });
    const geometry = new Three.BufferGeometry().setFromPoints(points);
    super(geometry, material);
  }
}