/**
 * ScreenReaderAnnouncer
 * ARIA live region for screen reader announcements
 */

export class ScreenReaderAnnouncer {
  constructor() {
    this.element = null;
    this.queue = [];
    this.isAnnouncing = false;
  }

  create() {
    this.element = document.createElement('div');
    this.element.id = 'sr-announcer';
    this.element.className = 'sr-announcer';
    this.element.setAttribute('role', 'status');
    this.element.setAttribute('aria-live', 'polite');
    this.element.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.element);
    return this.element;
  }

  announce(message, priority = 'polite') {
    if (!this.element) {
      this.create();
    }

    this.queue.push({ message, priority });
    
    if (!this.isAnnouncing) {
      this.processQueue();
    }
  }

  processQueue() {
    if (this.queue.length === 0) {
      this.isAnnouncing = false;
      return;
    }

    this.isAnnouncing = true;
    const { message, priority } = this.queue.shift();
    
    this.element.setAttribute('aria-live', priority);
    this.element.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      this.element.textContent = '';
      this.processQueue();
    }, 1000);
  }

  announceImmediate(message) {
    this.announce(message, 'assertive');
  }

  clear() {
    if (this.element) {
      this.element.textContent = '';
    }
    this.queue = [];
    this.isAnnouncing = false;
  }
}

export const screenReader = new ScreenReaderAnnouncer();
