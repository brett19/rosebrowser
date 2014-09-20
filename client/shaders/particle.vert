attribute float psize;
attribute float alpha;
attribute vec3 color;

varying vec3 vColor;
varying float vAlpha;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

    vColor = color;
    vAlpha = alpha;
    gl_PointSize = psize * ( 200.0 / length( mvPosition.xyz ) );
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
