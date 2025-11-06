/**
 * FocusManager
 * Manages keyboard navigation and focus trapping
 */

export class FocusManager {
  constructor() {
    this.focusTrap = null;
    this.previousFocus = null;
    this.usingKeyboard = false;
  }

  init() {
    // Detect keyboard vs mouse usage
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.usingKeyboard = true;
        document.body.classList.add('using-keyboard');
        document.body.classList.remove('using-mouse');
      }
    });

    window.addEventListener('mousedown', () => {
      this.usingKeyboard = false;
      document.body.classList.add('using-mouse');
      document.body.classList.remove('using-keyboard');
    });

    // Skip to main content link
    this.createSkipLink();
  }

  createSkipLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Skip to content';
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      const mainContent = document.getElementById('main-content') || 
                         document.querySelector('main') ||
                         document.querySelector('[role="main"]');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView();
      }
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  trapFocus(container) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    this.focusTrap = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    container.addEventListener('keydown', this.focusTrap);
    this.previousFocus = document.activeElement;
    firstFocusable.focus();
  }

  releaseFocusTrap(container) {
    if (this.focusTrap) {
      container.removeEventListener('keydown', this.focusTrap);
      this.focusTrap = null;
    }

    if (this.previousFocus) {
      this.previousFocus.focus();
      this.previousFocus = null;
    }
  }

  focusFirstElement(container) {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) {
      focusable.focus();
    }
  }

  getFocusableElements(container) {
    return container.querySelectorAll(
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
    );
  }
}

export const focusManager = new FocusManager();
