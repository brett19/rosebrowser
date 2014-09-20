uniform sampler2D texture1;
varying vec3 vColor;
varying float vAlpha;

void main() {
    gl_FragColor = texture2D(texture1, gl_PointCoord) * vec4(vColor, vAlpha);
}
