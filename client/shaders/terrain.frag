uniform sampler2D texture1;
uniform sampler2D texture2;
uniform sampler2D texture3;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {
  vec4 layer1 = texture2D(texture1, vUv1);
  vec4 layer2 = texture2D(texture2, vUv2);
  vec4 baseColor = mix(layer1, layer2, layer2.a);
  gl_FragColor = baseColor * texture2D(texture3, vUv3) * 2.0;
}
