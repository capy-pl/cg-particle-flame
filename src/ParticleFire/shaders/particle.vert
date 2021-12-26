attribute size;
attribute vec3 customColor;

varying vec3 vColor;
void main() {
    vColor = customColor;
    vec4 worldPos = modelViewMatrix * vec4(position, 1.0);
    float cameraDist = length(worldPos.xyz - position.xyz);
    gl_PointSize = size * 300.0 / cameraDist;
    gl_Position = projectionMatrix * worldPos;
}