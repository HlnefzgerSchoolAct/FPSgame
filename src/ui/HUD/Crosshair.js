/**
 * Crosshair Component
 * Dynamic crosshair with spread feedback and hit markers
 */

export class Crosshair {
  constructor(options = {}) {
    const {
      style = 'cross', // cross, dot, circle, cross-dot
      color = 'rgba(255, 255, 255, 0.9)',
      size = 40,
      thickness = 2,
      gap = 8,
      showDot = false,
      dynamicSpread = true
    } = options;

    this.style = style;
    this.color = color;
    this.size = size;
    this.thickness = thickness;
    this.gap = gap;
    this.showDot = showDot;
    this.dynamicSpread = dynamicSpread;
    this.currentSpread = 0;
    this.element = null;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'crosshair';
    this.element.id = 'crosshair';
    this.element.style.width = `${this.size}px`;
    this.element.style.height = `${this.size}px`;

    if (this.style === 'cross' || this.style === 'cross-dot') {
      this.createCrossLines();
    }

    if (this.style === 'dot' || this.style === 'cross-dot' || this.showDot) {
      this.createDot();
    }

    if (this.style === 'circle') {
      this.createCircle();
    }

    this.applyColors();
    return this.element;
  }

  createCrossLines() {
    const positions = ['top', 'bottom', 'left', 'right'];
    positions.forEach(pos => {
      const line = document.createElement('div');
      line.className = `crosshair-line ${pos}`;
      
      if (pos === 'top' || pos === 'bottom') {
        line.style.width = `${this.thickness}px`;
        line.style.height = `${this.gap}px`;
      } else {
        line.style.width = `${this.gap}px`;
        line.style.height = `${this.thickness}px`;
      }
      
      this.element.appendChild(line);
    });
  }

  createDot() {
    const dot = document.createElement('div');
    dot.className = 'crosshair-dot';
    dot.style.width = `${this.thickness * 2}px`;
    dot.style.height = `${this.thickness * 2}px`;
    this.element.appendChild(dot);
  }

  createCircle() {
    const circle = document.createElement('div');
    circle.className = 'crosshair-circle';
    circle.style.width = `${this.size}px`;
    circle.style.height = `${this.size}px`;
    circle.style.border = `${this.thickness}px solid ${this.color}`;
    this.element.appendChild(circle);
  }

  applyColors() {
    const lines = this.element.querySelectorAll('.crosshair-line, .crosshair-dot');
    lines.forEach(line => {
      line.style.background = this.color;
    });
  }

  updateSpread(spread) {
    if (!this.dynamicSpread) return;
    
    this.currentSpread = spread;
    const lines = this.element.querySelectorAll('.crosshair-line');
    const offset = this.gap + (spread * 3); // Base gap + spread multiplier

    if (lines.length >= 4) {
      lines[0].style.top = `-${offset}px`; // top
      lines[1].style.bottom = `-${offset}px`; // bottom
      lines[2].style.left = `-${offset}px`; // left
      lines[3].style.right = `-${offset}px`; // right
    }
  }

  setColor(color) {
    this.color = color;
    this.applyColors();
    
    const circle = this.element.querySelector('.crosshair-circle');
    if (circle) {
      circle.style.borderColor = color;
    }
  }

  setSize(size) {
    this.size = size;
    if (this.element) {
      this.element.style.width = `${size}px`;
      this.element.style.height = `${size}px`;
    }
  }

  hide() {
    if (this.element) {
      this.element.style.opacity = '0';
    }
  }

  show() {
    if (this.element) {
      this.element.style.opacity = '1';
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

// Event integration
export function setupCrosshairEvents(crosshair) {
  window.addEventListener('hud:crosshair:spread', (e) => {
    crosshair.updateSpread(e.detail.spread || 0);
  });

  window.addEventListener('hud:crosshair:hide', () => {
    crosshair.hide();
  });

  window.addEventListener('hud:crosshair:show', () => {
    crosshair.show();
  });
}
