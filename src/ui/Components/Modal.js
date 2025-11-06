/**
 * Modal Component
 * Accessible modal dialog with focus trap
 */

export class Modal {
  constructor(options = {}) {
    const {
      title = '',
      content = '',
      onClose = null,
      showCloseButton = true,
      closeOnBackdrop = true,
      size = 'medium', // small, medium, large
      className = ''
    } = options;

    this.title = title;
    this.content = content;
    this.onClose = onClose;
    this.showCloseButton = showCloseButton;
    this.closeOnBackdrop = closeOnBackdrop;
    this.size = size;
    this.className = className;
    this.element = null;
    this.focusTrap = null;
    this.previousFocus = null;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = `modal-overlay ${this.className}`;
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    if (this.title) {
      this.element.setAttribute('aria-labelledby', 'modal-title');
    }

    const modalContainer = document.createElement('div');
    modalContainer.className = `modal-container modal-${this.size}`;

    // Header
    if (this.title || this.showCloseButton) {
      const header = document.createElement('div');
      header.className = 'modal-header';

      if (this.title) {
        const titleEl = document.createElement('h2');
        titleEl.id = 'modal-title';
        titleEl.className = 'modal-title';
        titleEl.textContent = this.title;
        header.appendChild(titleEl);
      }

      if (this.showCloseButton) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.setAttribute('aria-label', 'Close modal');
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);
      }

      modalContainer.appendChild(header);
    }

    // Content
    const contentEl = document.createElement('div');
    contentEl.className = 'modal-content';
    if (typeof this.content === 'string') {
      contentEl.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      contentEl.appendChild(this.content);
    }
    modalContainer.appendChild(contentEl);

    this.element.appendChild(modalContainer);

    // Backdrop click
    if (this.closeOnBackdrop) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }

    // Escape key
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);

    return this.element;
  }

  open() {
    if (!this.element) {
      this.create();
    }
    
    this.previousFocus = document.activeElement;
    document.body.appendChild(this.element);
    
    // Focus first focusable element
    setTimeout(() => {
      const focusable = this.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable) {
        focusable.focus();
      }
    }, 100);

    // Announce to screen readers
    this.announce('Modal opened');
  }

  close() {
    if (this.onClose) {
      this.onClose();
    }
    
    this.destroy();
    
    // Restore focus
    if (this.previousFocus) {
      this.previousFocus.focus();
    }

    // Announce to screen readers
    this.announce('Modal closed');
  }

  setContent(content) {
    this.content = content;
    if (this.element) {
      const contentEl = this.element.querySelector('.modal-content');
      if (contentEl) {
        if (typeof content === 'string') {
          contentEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          contentEl.innerHTML = '';
          contentEl.appendChild(content);
        }
      }
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
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
    this.element = null;
  }
}

export const modalStyles = `
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-lg);
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slide-up 0.3s ease;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-small {
  width: 400px;
}

.modal-medium {
  width: 600px;
}

.modal-large {
  width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  font-size: var(--font-size-2xl);
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.modal-content {
  padding: var(--space-lg);
  overflow-y: auto;
  flex: 1;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 95vw;
    max-height: 85vh;
  }
  
  .modal-small,
  .modal-medium,
  .modal-large {
    width: 100%;
  }
}
`;
