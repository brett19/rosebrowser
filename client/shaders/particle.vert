uniform vec2 uvScale;
uniform vec2 uvOffset;
varying vec2 vUv1;

void main() {
  vUv1 = uv * uvScale + uvOffset;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
