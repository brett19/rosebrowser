uniform vec2 vLmOffset;
uniform vec2 vLmScale;
varying vec2 vUv1;
varying vec2 vUv2;

void main() {
  vUv1 = uv;
  vUv2 = uv2 * vLmScale + vLmOffset;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
