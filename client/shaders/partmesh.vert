attribute float alpha;
varying vec2 vUv1;
varying float fAlpha;

void main() {
  vUv1 = uv;
  fAlpha = alpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
