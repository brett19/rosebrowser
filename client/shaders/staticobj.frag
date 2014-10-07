uniform sampler2D texture1;
uniform sampler2D texture2;
varying vec2 vUv1;
varying vec2 vUv2;

void main() {
  vec4 baseColor = texture2D(texture1, vUv1);
  #ifdef ALPHATEST
  if ( baseColor.a < ALPHATEST ) discard;
  #endif
  gl_FragColor = baseColor * texture2D(texture2, vUv2) * 2.4;
}
