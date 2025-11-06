/**
 * ProgressBar Component
 * Animated progress bar with percentage display
 */

export class ProgressBar {
  constructor(options = {}) {
    const {
      value = 0,
      max = 100,
      showLabel = true,
      animated = true,
      color = 'primary',
      size = 'medium',
      className = ''
    } = options;

    this.value = value;
    this.max = max;
    this.showLabel = showLabel;
    this.animated = animated;
    this.color = color;
    this.size = size;
    this.className = className;
    this.element = null;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = `progress-bar progress-${this.size} ${this.className}`;
    this.element.setAttribute('role', 'progressbar');
    this.element.setAttribute('aria-valuemin', '0');
    this.element.setAttribute('aria-valuemax', this.max);
    this.element.setAttribute('aria-valuenow', this.value);

    const fill = document.createElement('div');
    fill.className = `progress-fill progress-${this.color}`;
    if (this.animated) fill.classList.add('progress-animated');
    fill.style.width = `${(this.value / this.max) * 100}%`;

    if (this.showLabel) {
      const label = document.createElement('span');
      label.className = 'progress-label';
      label.textContent = `${Math.round((this.value / this.max) * 100)}%`;
      this.element.appendChild(label);
    }

    this.element.appendChild(fill);
    return this.element;
  }

  setValue(value) {
    this.value = Math.max(0, Math.min(value, this.max));
    if (this.element) {
      const fill = this.element.querySelector('.progress-fill');
      const label = this.element.querySelector('.progress-label');
      const percentage = (this.value / this.max) * 100;
      
      fill.style.width = `${percentage}%`;
      if (label) {
        label.textContent = `${Math.round(percentage)}%`;
      }
      
      this.element.setAttribute('aria-valuenow', this.value);
    }
  }

  setMax(max) {
    this.max = max;
    this.setValue(this.value);
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export const progressBarStyles = `
.progress-bar {
  position: relative;
  width: 100%;
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.progress-small { height: 8px; }
.progress-medium { height: 24px; }
.progress-large { height: 32px; }

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  position: relative;
}

.progress-animated {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 40px 40px;
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  from { background-position: 0 0; }
  to { background-position: 40px 0; }
}

.progress-primary {
  background: linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400));
}

.progress-success {
  background: linear-gradient(90deg, var(--color-success-600), var(--color-success-400));
}

.progress-warning {
  background: linear-gradient(90deg, var(--color-warning-600), var(--color-warning-400));
}

.progress-danger {
  background: linear-gradient(90deg, var(--color-danger-600), var(--color-danger-400));
}

.progress-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
  z-index: 1;
}
`;
