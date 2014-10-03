varying vec2 vUv1;

void main() {
  vUv1 = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
