// Color grading fragment shader
uniform sampler2D tDiffuse;
uniform float uContrast;
uniform float uBrightness;
uniform float uSaturation;

varying vec2 vUv;

vec3 adjustContrast(vec3 color, float contrast) {
  return (color - 0.5) * contrast + 0.5;
}

vec3 adjustSaturation(vec3 color, float saturation) {
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  return mix(vec3(luminance), color, saturation);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Apply brightness
  vec3 result = color.rgb * uBrightness;
  
  // Apply contrast
  result = adjustContrast(result, uContrast);
  
  // Apply saturation
  result = adjustSaturation(result, uSaturation);
  
  gl_FragColor = vec4(result, color.a);
}
