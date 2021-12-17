attribute vec3 pos;
attribute vec3 tex;

out vec3 texout;

void main() {
    texout = tex;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
