uniform vec3 color;
uniform sampler2D texture;
varying vec3 vColor;

void main() {
    vec4 col = vec4(vColor, 1.0);
    gl_FragColor = col * texture2D(texture, gl_PointCoord);
}