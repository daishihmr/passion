attribute vec2 position;
attribute vec2 uv;

attribute vec2 instancePosition;
attribute float instanceRotation;
attribute float instanceScale;
attribute vec2 instanceFrame;
attribute float instanceVisible;
attribute float instanceBrightness;
attribute vec3 instanceAuraColor;

uniform mat4 vpMatrix;
uniform float globalScale;

varying vec2 vUv;
varying vec2 vFrame;
varying float vInstanceBrightness;
varying vec3 vInstanceAuraColor;

void main(void) {
  vUv = uv;
  vFrame = instanceFrame;
  vInstanceBrightness = instanceBrightness;
  vInstanceAuraColor = instanceAuraColor;
  
  if (instanceVisible > 0.0) {
    float s = sin(-instanceRotation);
    float c = cos(-instanceRotation);
    mat4 m = mat4(
      vec4(  c,  -s, 0.0, 0.0),
      vec4(  s,   c, 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(instancePosition, 0.0, 1.0)
    ) * mat4(
      vec4(instanceScale * globalScale, 0.0, 0.0, 0.0),
      vec4(0.0, instanceScale * globalScale, 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );
    mat4 mvpMatrix = vpMatrix * m;
    gl_Position = mvpMatrix * vec4(position, 0.0, 1.0);
  } else {
    gl_Position = vec4(0.0);
  }
}
