uniform sampler2D texture1;
uniform vec3 vColor;
uniform float vAlpha;
varying vec2 vUv1;

void main() {
  gl_FragColor = texture2D(texture1, vUv1) * vec4(vColor, vAlpha);
}
