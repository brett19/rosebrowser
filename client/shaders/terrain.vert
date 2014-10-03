attribute vec2 uv3;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {
  vUv1 = uv;
  vUv2 = uv2;
  vUv3 = uv3;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
