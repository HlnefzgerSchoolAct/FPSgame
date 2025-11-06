/**
 * Dropdown Component
 * Accessible dropdown select
 */

export class Dropdown {
  constructor(options = {}) {
    const {
      label = '',
      options: dropdownOptions = [],
      value = '',
      onChange = null,
      disabled = false,
      placeholder = 'Select...',
      id = `dropdown-${Date.now()}`
    } = options;

    this.label = label;
    this.options = dropdownOptions;
    this.value = value;
    this.onChange = onChange;
    this.disabled = disabled;
    this.placeholder = placeholder;
    this.id = id;
    this.element = null;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'dropdown-wrapper';

    if (this.label) {
      const labelEl = document.createElement('label');
      labelEl.htmlFor = this.id;
      labelEl.className = 'dropdown-label';
      labelEl.textContent = this.label;
      this.element.appendChild(labelEl);
    }

    const select = document.createElement('select');
    select.id = this.id;
    select.className = 'dropdown-select';
    select.disabled = this.disabled;

    // Placeholder option
    if (this.placeholder) {
      const placeholderOption = document.createElement('option');
      placeholderOption.value = '';
      placeholderOption.textContent = this.placeholder;
      placeholderOption.disabled = true;
      placeholderOption.selected = !this.value;
      select.appendChild(placeholderOption);
    }

    // Options
    this.options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      option.selected = opt.value === this.value;
      if (opt.disabled) {
        option.disabled = true;
      }
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      this.value = e.target.value;
      if (this.onChange) {
        this.onChange(this.value);
      }
    });

    this.element.appendChild(select);
    return this.element;
  }

  setValue(value) {
    this.value = value;
    if (this.element) {
      const select = this.element.querySelector('select');
      if (select) {
        select.value = value;
      }
    }
  }

  setOptions(options) {
    this.options = options;
    if (this.element) {
      const select = this.element.querySelector('select');
      if (select) {
        // Clear existing options except placeholder
        while (select.options.length > (this.placeholder ? 1 : 0)) {
          select.remove(this.placeholder ? 1 : 0);
        }
        
        // Add new options
        options.forEach(opt => {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.label;
          option.selected = opt.value === this.value;
          if (opt.disabled) {
            option.disabled = true;
          }
          select.appendChild(option);
        });
      }
    }
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.element) {
      const select = this.element.querySelector('select');
      if (select) {
        select.disabled = disabled;
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

export const dropdownStyles = `
.dropdown-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.dropdown-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.dropdown-select {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-family: var(--font-primary);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  min-height: 44px;
}

.dropdown-select:hover:not(:disabled) {
  border-color: var(--color-primary-500);
}

.dropdown-select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.dropdown-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown-select option {
  background: var(--color-surface);
  color: var(--color-text-primary);
  padding: var(--space-sm);
}
`;
