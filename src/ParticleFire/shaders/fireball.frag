varying vec2 vUv;
varying float noise;
uniform vec3 colLight;
uniform vec3 colNormal;
uniform vec3 colDark;
uniform float test;

vec3 blend(vec3 cola, vec3 colb, float percent) {
  vec3 col = cola + (colb - cola) * percent;
  return col;
}

float random( vec3 scale, float seed ){
  return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
}

void main() {
  float range = 1.0 * noise;
  vec3 col;

  if (noise > 0.6) {
    col = colDark;
  } else if (noise > 0.4) {
    col = blend(colNormal, colDark, (noise - 0.4) / 0.2);
  } else {
    col = blend(colLight, colNormal, noise / 0.4);
  }

  gl_FragColor = vec4( col, 0.8 );
  // gl_FragColor = vec4( vec3( vUv, 0. ), 1. );
}
