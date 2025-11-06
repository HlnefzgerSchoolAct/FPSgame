/**
 * Toast Component
 * Notification toast messages
 */

export class Toast {
  constructor(options = {}) {
    const {
      message = '',
      type = 'info', // info, success, warning, error
      duration = 3000,
      position = 'top-right', // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
      onClose = null
    } = options;

    this.message = message;
    this.type = type;
    this.duration = duration;
    this.position = position;
    this.onClose = onClose;
    this.element = null;
    this.timer = null;
  }

  static container = null;

  static getContainer() {
    if (!Toast.container) {
      Toast.container = document.createElement('div');
      Toast.container.className = 'toast-container';
      document.body.appendChild(Toast.container);
    }
    return Toast.container;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = `toast toast-${this.type}`;
    this.element.setAttribute('role', 'alert');
    this.element.setAttribute('aria-live', 'polite');

    const icon = this.getIcon();
    if (icon) {
      const iconEl = document.createElement('span');
      iconEl.className = 'toast-icon';
      iconEl.textContent = icon;
      this.element.appendChild(iconEl);
    }

    const messageEl = document.createElement('span');
    messageEl.className = 'toast-message';
    messageEl.textContent = this.message;
    this.element.appendChild(messageEl);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => this.close());
    this.element.appendChild(closeBtn);

    return this.element;
  }

  getIcon() {
    const icons = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✕'
    };
    return icons[this.type] || '';
  }

  show() {
    if (!this.element) {
      this.create();
    }

    const container = Toast.getContainer();
    container.className = `toast-container toast-${this.position}`;
    container.appendChild(this.element);

    // Auto-close after duration
    if (this.duration > 0) {
      this.timer = setTimeout(() => this.close(), this.duration);
    }

    // Announce to screen readers
    this.announce(this.message);
  }

  close() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (this.element) {
      this.element.classList.add('toast-hiding');
      setTimeout(() => {
        this.destroy();
        if (this.onClose) {
          this.onClose();
        }
      }, 300);
    }
  }

  announce(message) {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }

  // Static helper methods
  static show(message, type = 'info', duration = 3000) {
    const toast = new Toast({ message, type, duration });
    toast.show();
    return toast;
  }

  static info(message, duration = 3000) {
    return Toast.show(message, 'info', duration);
  }

  static success(message, duration = 3000) {
    return Toast.show(message, 'success', duration);
  }

  static warning(message, duration = 3000) {
    return Toast.show(message, 'warning', duration);
  }

  static error(message, duration = 3000) {
    return Toast.show(message, 'error', duration);
  }
}

export const toastStyles = `
.toast-container {
  position: fixed;
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  pointer-events: none;
  max-width: 400px;
}

.toast-container.toast-top-right {
  top: var(--space-lg);
  right: var(--space-lg);
}

.toast-container.toast-top-left {
  top: var(--space-lg);
  left: var(--space-lg);
}

.toast-container.toast-bottom-right {
  bottom: var(--space-lg);
  right: var(--space-lg);
}

.toast-container.toast-bottom-left {
  bottom: var(--space-lg);
  left: var(--space-lg);
}

.toast-container.toast-top-center {
  top: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
}

.toast-container.toast-bottom-center {
  bottom: var(--space-lg);
  left: 50%;
  transform: translateX(-50%);
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border-left: 4px solid;
  box-shadow: var(--shadow-lg);
  pointer-events: all;
  animation: slide-in 0.3s ease;
  backdrop-filter: blur(8px);
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-hiding {
  animation: slide-out 0.3s ease forwards;
}

@keyframes slide-out {
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

.toast-info {
  border-left-color: var(--color-primary-500);
}

.toast-success {
  border-left-color: var(--color-success-500);
}

.toast-warning {
  border-left-color: var(--color-warning-500);
}

.toast-error {
  border-left-color: var(--color-danger-500);
}

.toast-icon {
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.toast-info .toast-icon { color: var(--color-primary-500); }
.toast-success .toast-icon { color: var(--color-success-500); }
.toast-warning .toast-icon { color: var(--color-warning-500); }
.toast-error .toast-icon { color: var(--color-danger-500); }

.toast-message {
  flex: 1;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.toast-close {
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  font-size: var(--font-size-xl);
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
  flex-shrink: 0;
}

.toast-close:hover {
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .toast-container {
    max-width: calc(100vw - 2 * var(--space-lg));
  }
}
`;
