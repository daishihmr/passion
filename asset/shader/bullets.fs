precision mediump float;

uniform sampler2D texture;

varying vec2 vUv;
varying vec2 vFrame;
varying float vInstanceBrightness;
varying vec3 vInstanceAuraColor;

const float unit = 1.0 / 8.0;

void main(void){
  vec4 tc = texture2D(texture, vUv + vFrame * unit);

  vec4 aura = vec4(vInstanceAuraColor, 0.0);
  aura.a = (0.55 - length(vUv / unit - vec2(0.5))) * 0.8;

  if (aura.a > tc.a) {
    gl_FragColor = aura;
  } else {
    gl_FragColor = vec4(tc.rgb * vInstanceBrightness, tc.a) * vec4(1.2, 0.8, 0.8, 1.0);
  }
}
