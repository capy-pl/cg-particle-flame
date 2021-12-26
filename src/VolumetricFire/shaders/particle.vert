attribute vec3 position;
attribute vec3 tex;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying vec3 texout;

void main() {
    texout = tex;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
