uniform sampler2D texture1;
varying vec2 vUv1;
varying vec2 vUv2;

void main() {
  vec4 baseColor = texture2D(texture1, vUv2);
  gl_FragColor = baseColor;
}
