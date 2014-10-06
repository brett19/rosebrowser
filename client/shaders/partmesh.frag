uniform sampler2D texture1;
varying vec2 vUv1;
varying float fAlpha;

void main() {
  vec4 color = texture2D(texture1, vUv1);
  #ifdef ALPHATEST
  if ( color.a < ALPHATEST ) discard;
  #endif
  color *= fAlpha;
  gl_FragColor = color;
}
