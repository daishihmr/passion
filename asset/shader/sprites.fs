precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;
varying vec4 vFrame;
varying vec4 vColor;

void main(void){
  vec4 tc = texture2D(texture, vFrame.xy + vUv * vFrame.zw);
  // vec4 tc = texture2D(texture, vUv);
  gl_FragColor = tc * vColor;
}
