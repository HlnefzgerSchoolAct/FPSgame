// Muzzle flash fragment shader
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
  // Radial gradient from center
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vUv, center);
  
  // Flash intensity falloff
  float alpha = smoothstep(0.5, 0.0, dist) * uIntensity;
  
  // Flickering effect
  alpha *= 0.8 + 0.2 * sin(uTime * 50.0);
  
  gl_FragColor = vec4(uColor, alpha);
}
