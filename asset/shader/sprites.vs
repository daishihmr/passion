attribute vec2 position;
attribute vec2 uv;

attribute float instanceVisible;
attribute vec2 instancePosition;
attribute float instanceRotation;
attribute vec2 instanceScale;
attribute vec4 instanceFrame;
attribute vec4 instanceColor;

uniform mat4 vpMatrix;
uniform float globalScale;

varying vec2 vUv;
varying vec4 vFrame;
varying vec4 vColor;

void main(void) {
  vUv = uv;
  vFrame = instanceFrame;
  vColor = instanceColor;
  
  if (instanceVisible > 0.0) {
    float s = sin(-instanceRotation);
    float c = cos(-instanceRotation);
    mat4 m = mat4(
      vec4(  c,  -s, 0.0, 0.0),
      vec4(  s,   c, 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(instancePosition, 0.0, 1.0)
    ) * mat4(
      vec4(instanceScale.x * globalScale, 0.0, 0.0, 0.0),
      vec4(0.0, instanceScale.y * globalScale, 0.0, 0.0),
      vec4(0.0, 0.0, 1.0, 0.0),
      vec4(0.0, 0.0, 0.0, 1.0)
    );
    mat4 mvpMatrix = vpMatrix * m;
    gl_Position = mvpMatrix * vec4(position, 0.0, 1.0);
  } else {
    gl_Position = vec4(0.0);
  }
}
