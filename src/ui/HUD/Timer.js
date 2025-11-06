/**
 * Timer Component
 * Match timer display
 */

export class Timer {
  constructor() {
    this.element = null;
    this.timeRemaining = 0;
    this.isWarning = false;
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'hud-timer';
    this.element.id = 'hud-timer';
    this.element.textContent = '0:00';
    this.element.setAttribute('role', 'timer');
    return this.element;
  }

  setTime(seconds) {
    this.timeRemaining = seconds;
    this.updateDisplay();
    
    // Add warning class when time is low
    if (seconds <= 30 && seconds > 0) {
      if (!this.isWarning) {
        this.element.classList.add('warning');
        this.isWarning = true;
      }
    } else {
      if (this.isWarning) {
        this.element.classList.remove('warning');
        this.isWarning = false;
      }
    }
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    this.element.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
    }
  }

  show() {
    if (this.element) {
      this.element.style.display = 'block';
    }
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}

export function setupTimerEvents(timer) {
  window.addEventListener('match:timer:update', (e) => {
    timer.setTime(e.detail.timeRemaining);
  });

  window.addEventListener('match:start', () => {
    timer.show();
  });

  window.addEventListener('match:end', () => {
    timer.hide();
  });
}
