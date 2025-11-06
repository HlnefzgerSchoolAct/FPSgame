/**
 * AudioPool.js - Pool for audio source objects
 */
import { ObjectPool } from './ObjectPool.js';

export class AudioPool extends ObjectPool {
  constructor(audioContext, initialSize = 20, maxSize = 100) {
    const factory = () => {
      const source = {
        gainNode: audioContext.createGain(),
        panNode: audioContext.createStereoPanner ? 
                  audioContext.createStereoPanner() : 
                  audioContext.createPanner(),
        bufferSource: null,
        userData: {
          active: false,
          buffer: null,
          startTime: 0,
          duration: 0,
          loop: false,
          volume: 1.0,
          playbackRate: 1.0
        }
      };
      
      // Connect nodes
      source.gainNode.connect(audioContext.destination);
      if (source.panNode.connect) {
        source.panNode.connect(source.gainNode);
      }
      
      return source;
    };
    
    const reset = (source) => {
      if (source.bufferSource) {
        try {
          source.bufferSource.stop();
          source.bufferSource.disconnect();
        } catch (e) {
          // Already stopped
        }
        source.bufferSource = null;
      }
      
      source.userData.active = false;
      source.userData.buffer = null;
      source.userData.startTime = 0;
      source.userData.duration = 0;
      source.userData.loop = false;
      source.gainNode.gain.value = 1.0;
    };
    
    super(factory, reset, initialSize, maxSize);
    this.audioContext = audioContext;
  }
  
  /**
   * Play a sound from the pool
   */
  play(buffer, options = {}) {
    if (!buffer) {
      console.warn('AudioPool: No buffer provided');
      return null;
    }
    
    const source = this.acquire();
    
    // Create buffer source
    source.bufferSource = this.audioContext.createBufferSource();
    source.bufferSource.buffer = buffer;
    source.bufferSource.loop = options.loop || false;
    source.bufferSource.playbackRate.value = options.playbackRate || 1.0;
    
    // Set volume
    source.gainNode.gain.value = options.volume !== undefined ? options.volume : 1.0;
    
    // Set panning
    if (options.pan !== undefined && source.panNode.pan) {
      source.panNode.pan.value = Math.max(-1, Math.min(1, options.pan));
    }
    
    // Connect and play
    source.bufferSource.connect(source.panNode || source.gainNode);
    
    source.userData.active = true;
    source.userData.buffer = buffer;
    source.userData.startTime = this.audioContext.currentTime;
    source.userData.duration = buffer.duration;
    source.userData.loop = options.loop || false;
    
    source.bufferSource.start(0);
    
    // Auto-release when done (if not looping)
    if (!options.loop) {
      source.bufferSource.onended = () => {
        this.release(source);
      };
    }
    
    return source;
  }
  
  /**
   * Stop and release a playing source
   */
  stop(source) {
    if (source && source.userData.active) {
      this.release(source);
    }
  }
  
  /**
   * Update volume of a playing source
   */
  setVolume(source, volume) {
    if (source && source.userData.active) {
      source.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
  
  /**
   * Fade volume
   */
  fadeVolume(source, targetVolume, duration) {
    if (source && source.userData.active) {
      const currentTime = this.audioContext.currentTime;
      source.gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + duration);
    }
  }
  
  /**
   * Stop all playing sources
   */
  stopAll() {
    const sources = Array.from(this.inUse);
    sources.forEach(source => {
      if (source.userData.active) {
        this.release(source);
      }
    });
  }
  
  /**
   * Dispose of all audio nodes
   */
  dispose() {
    this.stopAll();
    
    this.available.forEach(source => {
      if (source.gainNode) source.gainNode.disconnect();
      if (source.panNode) source.panNode.disconnect();
    });
    
    this.clear();
  }
}
