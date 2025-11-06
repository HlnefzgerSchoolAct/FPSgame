/**
 * Button Component
 * Accessible, reusable button with variants
 */

export class Button {
  constructor(options = {}) {
    const {
      label = 'Button',
      variant = 'primary', // primary, secondary, danger, success, ghost
      size = 'medium', // small, medium, large
      disabled = false,
      onClick = null,
      icon = null,
      fullWidth = false,
      ariaLabel = null,
      className = ''
    } = options;

    this.label = label;
    this.variant = variant;
    this.size = size;
    this.disabled = disabled;
    this.onClick = onClick;
    this.icon = icon;
    this.fullWidth = fullWidth;
    this.ariaLabel = ariaLabel;
    this.className = className;
    this.element = null;
  }

  create() {
    this.element = document.createElement('button');
    this.element.className = this.getClasses();
    this.element.textContent = this.label;
    this.element.disabled = this.disabled;
    
    if (this.ariaLabel) {
      this.element.setAttribute('aria-label', this.ariaLabel);
    }

    if (this.icon) {
      const iconEl = document.createElement('span');
      iconEl.className = 'button-icon';
      iconEl.textContent = this.icon;
      this.element.prepend(iconEl);
    }

    if (this.onClick) {
      this.element.addEventListener('click', (e) => {
        if (!this.disabled) {
          this.onClick(e);
        }
      });
    }

    return this.element;
  }

  getClasses() {
    const classes = ['btn', `btn-${this.variant}`, `btn-${this.size}`];
    if (this.fullWidth) classes.push('btn-full-width');
    if (this.className) classes.push(this.className);
    return classes.join(' ');
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.element) {
      this.element.disabled = disabled;
    }
  }

  setLabel(label) {
    this.label = label;
    if (this.element) {
      this.element.textContent = label;
      if (this.icon) {
        const iconEl = document.createElement('span');
        iconEl.className = 'button-icon';
        iconEl.textContent = this.icon;
        this.element.prepend(iconEl);
      }
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

// CSS for buttons (to be included in components.css or inline)
export const buttonStyles = `
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  user-select: none;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary-600);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-500);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-elevated);
}

.btn-danger {
  background: var(--color-danger-600);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-danger-500);
}

.btn-success {
  background: var(--color-success-600);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: var(--color-success-500);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--color-surface);
  border-color: var(--color-border);
}

.btn-small {
  padding: var(--space-xs) var(--space-md);
  font-size: var(--font-size-sm);
}

.btn-medium {
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--font-size-base);
}

.btn-large {
  padding: var(--space-md) var(--space-xl);
  font-size: var(--font-size-lg);
}

.btn-full-width {
  width: 100%;
}

.button-icon {
  display: inline-flex;
  font-size: 1.2em;
}
`;
