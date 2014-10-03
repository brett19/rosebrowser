uniform sampler2D texture1;
uniform sampler2D texture2;
uniform float blendRatio;
varying vec2 vUv1;

void main() {
  vec4 dayColor = texture2D(texture1, vUv1);
  vec4 nightColor = texture2D(texture2, vUv1);
  gl_FragColor = mix(dayColor, nightColor, blendRatio);
}
