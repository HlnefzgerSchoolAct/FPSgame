/**
 * Toggle Component
 * Accessible toggle switch
 */

export class Toggle {
  constructor(options = {}) {
    const {
      label = '',
      checked = false,
      disabled = false,
      onChange = null,
      id = `toggle-${Date.now()}`,
      ariaLabel = null
    } = options;

    this.label = label;
    this.checked = checked;
    this.disabled = disabled;
    this.onChange = onChange;
    this.id = id;
    this.ariaLabel = ariaLabel;
    this.element = null;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'toggle-wrapper';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = this.id;
    input.className = 'toggle-input';
    input.checked = this.checked;
    input.disabled = this.disabled;
    input.setAttribute('role', 'switch');
    input.setAttribute('aria-checked', this.checked);
    
    if (this.ariaLabel) {
      input.setAttribute('aria-label', this.ariaLabel);
    }

    input.addEventListener('change', (e) => {
      this.checked = e.target.checked;
      input.setAttribute('aria-checked', this.checked);
      if (this.onChange) {
        this.onChange(this.checked);
      }
    });

    const toggleEl = document.createElement('label');
    toggleEl.htmlFor = this.id;
    toggleEl.className = 'toggle';

    const slider = document.createElement('span');
    slider.className = 'toggle-slider';

    toggleEl.appendChild(slider);
    this.element.appendChild(input);
    this.element.appendChild(toggleEl);

    if (this.label) {
      const labelEl = document.createElement('label');
      labelEl.htmlFor = this.id;
      labelEl.className = 'toggle-label';
      labelEl.textContent = this.label;
      this.element.appendChild(labelEl);
    }

    return this.element;
  }

  setChecked(checked) {
    this.checked = checked;
    if (this.element) {
      const input = this.element.querySelector('input');
      if (input) {
        input.checked = checked;
        input.setAttribute('aria-checked', checked);
      }
    }
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.element) {
      const input = this.element.querySelector('input');
      if (input) {
        input.disabled = disabled;
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

export const toggleStyles = `
.toggle-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  cursor: pointer;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: var(--color-text-primary);
  border-radius: 50%;
  transition: transform var(--transition-fast);
}

.toggle-input:checked + .toggle .toggle-slider {
  background: var(--color-primary-600);
  border-color: var(--color-primary-500);
}

.toggle-input:checked + .toggle .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-input:disabled + .toggle {
  opacity: 0.5;
  cursor: not-allowed;
}

.toggle-input:focus-visible + .toggle .toggle-slider {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

.toggle-label {
  font-size: var(--font-size-base);
  cursor: pointer;
  user-select: none;
}

.toggle-input:disabled ~ .toggle-label {
  opacity: 0.5;
  cursor: not-allowed;
}
`;
