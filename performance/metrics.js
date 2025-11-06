/**
 * metrics.js - Performance monitoring and metrics collection
 * Tracks FPS, frame time, GC indicators, memory usage, and network throughput
 */

export class PerformanceMetrics {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.verbose = options.verbose || false;
    
    // Frame timing
    this.frameCount = 0;
    this.fps = 0;
    this.frameTime = 0;
    this.frameTimeMin = Infinity;
    this.frameTimeMax = 0;
    this.frameTimeAvg = 0;
    
    // Frame time histogram (buckets in ms)
    this.frameTimeHistogram = {
      '0-8': 0,     // Under 8ms (>120fps)
      '8-16': 0,    // 8-16ms (60-120fps)
      '16-33': 0,   // 16-33ms (30-60fps)
      '33-50': 0,   // 33-50ms (20-30fps)
      '50+': 0      // Over 50ms (<20fps)
    };
    
    // GC detection
    this.gcEvents = [];
    this.lastGCTime = 0;
    this.gcThreshold = 10; // ms threshold for GC spike detection
    
    // Memory tracking
    this.memory = {
      jsHeapSize: 0,
      jsHeapSizeLimit: 0,
      totalJSHeapSize: 0,
      usedJSHeapSize: 0
    };
    
    // GPU memory estimation
    this.gpuMemory = {
      textures: 0,
      geometries: 0,
      total: 0
    };
    
    // Network metrics
    this.network = {
      bytesReceived: 0,
      bytesSent: 0,
      packetsReceived: 0,
      packetsSent: 0,
      latency: 0,
      throughputIn: 0,  // bytes/sec
      throughputOut: 0  // bytes/sec
    };
    
    // Performance marks
    this.marks = new Map();
    this.measures = new Map();
    
    // Update intervals
    this.lastUpdate = performance.now();
    this.updateInterval = 1000; // Update stats every second
    
    // Frame time buffer for averaging
    this.frameTimeBuffer = [];
    this.frameTimeBufferSize = 60;
    
    // Stats.js integration
    this.stats = null;
    if (options.stats && typeof Stats !== 'undefined') {
      this.initStatsJS();
    }
    
    console.log('PerformanceMetrics initialized');
  }
  
  /**
   * Initialize Stats.js overlay
   */
  initStatsJS() {
    if (typeof Stats === 'undefined') {
      console.warn('Stats.js not loaded');
      return;
    }
    
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
    document.body.appendChild(this.stats.dom);
    this.stats.dom.style.position = 'absolute';
    this.stats.dom.style.left = '0px';
    this.stats.dom.style.top = '0px';
  }
  
  /**
   * Begin frame measurement
   */
  beginFrame() {
    if (!this.enabled) return;
    
    this.frameStartTime = performance.now();
    
    if (this.stats) {
      this.stats.begin();
    }
  }
  
  /**
   * End frame measurement
   */
  endFrame() {
    if (!this.enabled) return;
    
    const frameEndTime = performance.now();
    const frameTime = frameEndTime - this.frameStartTime;
    
    this.frameTime = frameTime;
    this.frameCount++;
    
    // Update frame time stats
    this.frameTimeMin = Math.min(this.frameTimeMin, frameTime);
    this.frameTimeMax = Math.max(this.frameTimeMax, frameTime);
    
    // Add to buffer for averaging
    this.frameTimeBuffer.push(frameTime);
    if (this.frameTimeBuffer.length > this.frameTimeBufferSize) {
      this.frameTimeBuffer.shift();
    }
    
    // Update histogram
    this._updateHistogram(frameTime);
    
    // Detect GC spikes
    this._detectGC(frameTime);
    
    // Update stats periodically
    const now = performance.now();
    if (now - this.lastUpdate >= this.updateInterval) {
      this._updateStats(now);
      this.lastUpdate = now;
    }
    
    if (this.stats) {
      this.stats.end();
    }
  }
  
  /**
   * Update frame time histogram
   * @private
   */
  _updateHistogram(frameTime) {
    if (frameTime < 8) {
      this.frameTimeHistogram['0-8']++;
    } else if (frameTime < 16) {
      this.frameTimeHistogram['8-16']++;
    } else if (frameTime < 33) {
      this.frameTimeHistogram['16-33']++;
    } else if (frameTime < 50) {
      this.frameTimeHistogram['33-50']++;
    } else {
      this.frameTimeHistogram['50+']++;
    }
  }
  
  /**
   * Detect potential GC events from frame time spikes
   * @private
   */
  _detectGC(frameTime) {
    if (frameTime > this.gcThreshold) {
      const event = {
        time: performance.now(),
        duration: frameTime,
        frameCount: this.frameCount
      };
      
      this.gcEvents.push(event);
      this.lastGCTime = event.time;
      
      // Keep only recent GC events (last 100)
      if (this.gcEvents.length > 100) {
        this.gcEvents.shift();
      }
      
      if (this.verbose) {
        console.warn(`GC spike detected: ${frameTime.toFixed(2)}ms`);
      }
    }
  }
  
  /**
   * Update statistics
   * @private
   */
  _updateStats(now) {
    // Calculate FPS
    const elapsed = (now - this.lastUpdate) / 1000;
    const framesSinceLastUpdate = this.frameCount - (this.lastFrameCount || 0);
    this.fps = framesSinceLastUpdate / elapsed;
    this.lastFrameCount = this.frameCount;
    
    // Calculate average frame time
    if (this.frameTimeBuffer.length > 0) {
      const sum = this.frameTimeBuffer.reduce((a, b) => a + b, 0);
      this.frameTimeAvg = sum / this.frameTimeBuffer.length;
    }
    
    // Update memory info
    this._updateMemoryInfo();
  }
  
  /**
   * Update memory information
   * @private
   */
  _updateMemoryInfo() {
    if (performance.memory) {
      this.memory.jsHeapSize = performance.memory.usedJSHeapSize;
      this.memory.jsHeapSizeLimit = performance.memory.jsHeapSizeLimit;
      this.memory.totalJSHeapSize = performance.memory.totalJSHeapSize;
      this.memory.usedJSHeapSize = performance.memory.usedJSHeapSize;
    }
  }
  
  /**
   * Mark a performance point
   */
  mark(name) {
    if (!this.enabled) return;
    
    const time = performance.now();
    this.marks.set(name, time);
    
    // Use Performance API
    if (performance.mark) {
      performance.mark(name);
    }
  }
  
  /**
   * Measure between two marks
   */
  measure(name, startMark, endMark) {
    if (!this.enabled) return;
    
    const startTime = this.marks.get(startMark);
    const endTime = this.marks.get(endMark);
    
    if (startTime !== undefined && endTime !== undefined) {
      const duration = endTime - startTime;
      this.measures.set(name, duration);
      
      // Use Performance API
      if (performance.measure) {
        try {
          performance.measure(name, startMark, endMark);
        } catch (e) {
          console.warn('Performance measure failed:', e);
        }
      }
      
      return duration;
    }
    
    return null;
  }
  
  /**
   * Track network packet
   */
  trackNetworkPacket(direction, bytes) {
    if (!this.enabled) return;
    
    if (direction === 'in' || direction === 'receive') {
      this.network.bytesReceived += bytes;
      this.network.packetsReceived++;
    } else if (direction === 'out' || direction === 'send') {
      this.network.bytesSent += bytes;
      this.network.packetsSent++;
    }
  }
  
  /**
   * Update network throughput
   */
  updateNetworkThroughput(deltaTime) {
    if (!this.enabled) return;
    
    // Calculate throughput in bytes/sec
    this.network.throughputIn = this.network.bytesReceived / deltaTime;
    this.network.throughputOut = this.network.bytesSent / deltaTime;
    
    // Reset counters for next measurement
    this.network.bytesReceived = 0;
    this.network.bytesSent = 0;
  }
  
  /**
   * Update network latency
   */
  updateLatency(latency) {
    this.network.latency = latency;
  }
  
  /**
   * Track GPU memory usage
   */
  trackGPUMemory(textures, geometries) {
    this.gpuMemory.textures = textures;
    this.gpuMemory.geometries = geometries;
    this.gpuMemory.total = textures + geometries;
  }
  
  /**
   * Get current metrics snapshot
   */
  getMetrics() {
    return {
      fps: Math.round(this.fps),
      frameTime: {
        current: this.frameTime.toFixed(2),
        avg: this.frameTimeAvg.toFixed(2),
        min: this.frameTimeMin.toFixed(2),
        max: this.frameTimeMax.toFixed(2)
      },
      histogram: { ...this.frameTimeHistogram },
      gc: {
        events: this.gcEvents.length,
        lastGC: this.lastGCTime,
        recentSpikes: this.gcEvents.slice(-10)
      },
      memory: {
        js: (this.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        jsLimit: (this.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + ' MB',
        gpu: (this.gpuMemory.total / 1024 / 1024).toFixed(2) + ' MB'
      },
      network: {
        latency: Math.round(this.network.latency) + ' ms',
        throughputIn: (this.network.throughputIn / 1024).toFixed(2) + ' KB/s',
        throughputOut: (this.network.throughputOut / 1024).toFixed(2) + ' KB/s',
        packetsIn: this.network.packetsReceived,
        packetsOut: this.network.packetsSent
      }
    };
  }
  
  /**
   * Log metrics to console
   */
  logMetrics() {
    if (!this.enabled) return;
    
    const metrics = this.getMetrics();
    console.log('=== Performance Metrics ===');
    console.log(`FPS: ${metrics.fps}`);
    console.log(`Frame Time: ${metrics.frameTime.current}ms (avg: ${metrics.frameTime.avg}ms)`);
    console.log(`Memory (JS): ${metrics.memory.js} / ${metrics.memory.jsLimit}`);
    console.log(`Memory (GPU): ${metrics.memory.gpu}`);
    console.log(`Network Latency: ${metrics.network.latency}`);
    console.log(`GC Events: ${metrics.gc.events}`);
    console.log('===========================');
  }
  
  /**
   * Reset all metrics
   */
  reset() {
    this.frameCount = 0;
    this.fps = 0;
    this.frameTime = 0;
    this.frameTimeMin = Infinity;
    this.frameTimeMax = 0;
    this.frameTimeBuffer = [];
    this.gcEvents = [];
    
    for (let key in this.frameTimeHistogram) {
      this.frameTimeHistogram[key] = 0;
    }
  }
  
  /**
   * Toggle metrics collection
   */
  toggle() {
    this.enabled = !this.enabled;
  }
  
  /**
   * Cleanup
   */
  dispose() {
    if (this.stats && this.stats.dom) {
      document.body.removeChild(this.stats.dom);
      this.stats = null;
    }
  }
}

// Export singleton instance
export const metrics = new PerformanceMetrics({ enabled: true, stats: true });
