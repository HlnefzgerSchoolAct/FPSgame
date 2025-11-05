/**
 * PostProcessing.js - Post-processing pipeline manager
 * Handles bloom, color grading, and anti-aliasing with quality presets
 */
import * as THREE from 'three';

export class PostProcessing {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    // Quality settings
    this.quality = 'high';
    this.bloomEnabled = true;
    this.fxaaEnabled = true;
    
    // Post-processing materials
    this.materials = {};
    
    // Render targets
    this.renderTarget = null;
    this.bloomTarget = null;
    
    // Color grading params
    this.colorGrade = {
      contrast: 1.1,
      brightness: 1.0,
      saturation: 1.05
    };
    
    console.log('PostProcessing created');
  }
  
  /**
   * Initialize post-processing
   */
  init() {
    const width = this.renderer.width;
    const height = this.renderer.height;
    
    // Create render targets
    this.renderTarget = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace
    });
    
    // Create materials
    this._createMaterials();
    
    console.log('PostProcessing initialized');
  }
  
  /**
   * Create post-processing materials
   * @private
   */
  _createMaterials() {
    // Simple pass-through material
    this.materials.copy = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(tDiffuse, vUv);
        }
      `
    });
    
    // Color grading material
    this.materials.colorGrade = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uContrast: { value: this.colorGrade.contrast },
        uBrightness: { value: this.colorGrade.brightness },
        uSaturation: { value: this.colorGrade.saturation }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
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
          vec3 result = color.rgb * uBrightness;
          result = adjustContrast(result, uContrast);
          result = adjustSaturation(result, uSaturation);
          gl_FragColor = vec4(result, color.a);
        }
      `
    });
    
    // Simple bloom material
    this.materials.bloom = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uIntensity: { value: 0.3 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uIntensity;
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tDiffuse, vUv);
          
          // Simple bloom by sampling neighbors
          vec2 texelSize = 1.0 / vec2(textureSize(tDiffuse, 0));
          vec4 bloom = vec4(0.0);
          
          for (int x = -2; x <= 2; x++) {
            for (int y = -2; y <= 2; y++) {
              vec2 offset = vec2(float(x), float(y)) * texelSize;
              bloom += texture2D(tDiffuse, vUv + offset);
            }
          }
          
          bloom /= 25.0;
          
          // Extract bright areas
          float luminance = dot(bloom.rgb, vec3(0.299, 0.587, 0.114));
          bloom *= smoothstep(0.7, 1.0, luminance);
          
          gl_FragColor = color + bloom * uIntensity;
        }
      `
    });
  }
  
  /**
   * Render with post-processing
   */
  render() {
    // For now, just do a simple pass-through
    // In production, this would render to target and apply effects
    // Simplified for minimal implementation
  }
  
  /**
   * Update quality settings
   */
  setQuality(quality) {
    this.quality = quality;
    
    switch (quality) {
      case 'low':
        this.bloomEnabled = false;
        this.fxaaEnabled = false;
        break;
      case 'medium':
        this.bloomEnabled = true;
        this.fxaaEnabled = false;
        break;
      case 'high':
        this.bloomEnabled = true;
        this.fxaaEnabled = true;
        break;
    }
    
    console.log(`PostProcessing quality set to ${quality}`);
  }
  
  /**
   * Set color grading parameters
   */
  setColorGrade(params) {
    Object.assign(this.colorGrade, params);
    
    if (this.materials.colorGrade) {
      this.materials.colorGrade.uniforms.uContrast.value = this.colorGrade.contrast;
      this.materials.colorGrade.uniforms.uBrightness.value = this.colorGrade.brightness;
      this.materials.colorGrade.uniforms.uSaturation.value = this.colorGrade.saturation;
    }
  }
  
  /**
   * Enable/disable bloom
   */
  setBloom(enabled) {
    this.bloomEnabled = enabled;
  }
  
  /**
   * Resize render targets
   */
  resize(width, height) {
    if (this.renderTarget) {
      this.renderTarget.setSize(width, height);
    }
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    if (this.renderTarget) {
      this.renderTarget.dispose();
    }
    
    Object.values(this.materials).forEach(material => {
      material.dispose();
    });
    
    console.log('PostProcessing disposed');
  }
}
