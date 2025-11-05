// Screen vignette fragment shader for damage effect
uniform sampler2D tDiffuse;
uniform float uIntensity;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  
  // Calculate vignette
  vec2 center = vec2(0.5, 0.5);
  float dist = distance(vUv, center);
  float vignette = smoothstep(0.8, 0.3, dist);
  
  // Mix with damage color
  vec3 damageColor = mix(color.rgb, uColor, (1.0 - vignette) * uIntensity);
  
  gl_FragColor = vec4(damageColor, color.a);
}
