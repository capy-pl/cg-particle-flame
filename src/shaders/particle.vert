attribute vec3 pos;
attribute vec3 tex;

varying vec3 texout;

void main() {
    texout = tex;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
