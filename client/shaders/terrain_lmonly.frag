uniform sampler2D texture1;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {
  gl_FragColor = texture2D(texture1, vUv3);
}
