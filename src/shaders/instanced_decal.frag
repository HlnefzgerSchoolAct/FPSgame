// Instanced decal fragment shader
uniform sampler2D uTexture;
uniform float uOpacity;

varying vec2 vUv;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);
  
  // Multiply blend for dark decals
  gl_FragColor = vec4(texColor.rgb, texColor.a * uOpacity);
}
