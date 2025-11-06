/**
 * KillFeed Component
 * Displays recent eliminations
 */

export class KillFeed {
  constructor(options = {}) {
    const {
      maxItems = 5,
      itemDuration = 5000
    } = options;

    this.maxItems = maxItems;
    this.itemDuration = itemDuration;
    this.element = null;
    this.items = [];
  }

  create() {
    this.element = document.createElement('div');
    this.element.className = 'kill-feed';
    this.element.id = 'kill-feed';
    this.element.setAttribute('role', 'log');
    this.element.setAttribute('aria-live', 'polite');
    return this.element;
  }

  addKill(killer, victim, weapon, isHeadshot = false) {
    const item = document.createElement('div');
    item.className = 'kill-feed-item';
    if (isHeadshot) item.classList.add('headshot');

    const killerSpan = document.createElement('span');
    killerSpan.className = 'kill-feed-killer';
    killerSpan.textContent = killer;

    const weaponIcon = document.createElement('span');
    weaponIcon.className = 'kill-feed-weapon';
    weaponIcon.textContent = '⚔';

    const victimSpan = document.createElement('span');
    victimSpan.className = 'kill-feed-victim';
    victimSpan.textContent = victim;

    item.appendChild(killerSpan);
    item.appendChild(weaponIcon);
    item.appendChild(victimSpan);

    if (isHeadshot) {
      const headshotIcon = document.createElement('span');
      headshotIcon.textContent = '💀';
      headshotIcon.style.marginLeft = 'var(--space-xs)';
      item.appendChild(headshotIcon);
    }

    this.element.prepend(item);
    this.items.push(item);

    // Remove after duration
    setTimeout(() => {
      item.classList.add('fade-out');
      setTimeout(() => {
        if (item.parentNode) {
          item.parentNode.removeChild(item);
        }
        this.items = this.items.filter(i => i !== item);
      }, 500);
    }, this.itemDuration);

    // Limit number of items
    while (this.items.length > this.maxItems) {
      const oldItem = this.items.shift();
      if (oldItem && oldItem.parentNode) {
        oldItem.parentNode.removeChild(oldItem);
      }
    }
  }

  clear() {
    if (this.element) {
      this.element.innerHTML = '';
    }
    this.items = [];
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
    this.items = [];
  }
}

export function setupKillFeedEvents(killFeed) {
  window.addEventListener('kill_feed:add', (e) => {
    const { killer, victim, weapon, isHeadshot } = e.detail;
    killFeed.addKill(killer, victim, weapon, isHeadshot);
  });

  window.addEventListener('match:end', () => {
    killFeed.clear();
  });
}
