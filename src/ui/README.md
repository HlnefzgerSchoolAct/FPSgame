# Arena Blitz UI/UX System

A comprehensive, accessible, and responsive UI/UX system for the Arena Blitz FPS game.

## Features

### ✨ Core Features
- **Framework-free**: Pure JavaScript, no dependencies
- **Accessible**: WCAG 2.1 AA compliant
- **Responsive**: Mobile, tablet, and desktop support
- **Localized**: Full i18n support
- **Event-driven**: Clean separation from game logic
- **Modular**: Reusable components

### 🎮 Components

#### HUD (Heads-Up Display)
- `Crosshair.js` - Dynamic crosshair with spread feedback
- `AmmoHealth.js` - Health/armor bars and ammunition display
- `KillFeed.js` - Real-time kill notifications
- `Timer.js` - Match countdown timer

#### Menus
- `MainMenu.js` - Navigation hub
- `Shop.js` - In-game store with dual currency
- `Settings.js` - Comprehensive settings (Video, Audio, Controls, Accessibility)

#### Reusable Components
- `Button.js` - Multi-variant buttons
- `Modal.js` - Accessible modal dialogs
- `Toast.js` - Notification system
- `ProgressBar.js` - Progress indicators
- `Toggle.js` - Switch components
- `Dropdown.js` - Select dropdowns

#### Accessibility
- `ColorBlindModes.js` - Colorblind mode support
- `ScreenReaderAnnouncer.js` - ARIA announcements
- `FocusManager.js` - Keyboard navigation

## Quick Start

### 1. Initialize the UI Manager

```javascript
import { uiManager } from './src/ui/UIManager.js';

// Initialize UI system (loads localization, sets up accessibility)
await uiManager.init();

// Show main menu
uiManager.showMainMenu();
```

### 2. Link CSS Files

```html
<link rel="stylesheet" href="/src/ui/Styles/base.css">
<link rel="stylesheet" href="/src/ui/Styles/theme.css">
<link rel="stylesheet" href="/src/ui/Styles/hud.css">
<link rel="stylesheet" href="/src/ui/Styles/menus.css">
<link rel="stylesheet" href="/src/ui/Styles/responsive.css">
<link rel="stylesheet" href="/src/ui/Styles/accessibility.css">
```

### 3. Update HUD During Gameplay

```javascript
// Update ammunition
uiManager.updateAmmo(currentAmmo, reserveAmmo);

// Update health
uiManager.updateHealth(health, maxHealth);

// Update armor
uiManager.updateArmor(armor, maxArmor);

// Update crosshair spread
uiManager.updateCrosshairSpread(spreadValue);

// Add kill feed entry
uiManager.addKillFeedEntry('Player1', 'Enemy1', 'AR', isHeadshot);

// Update timer
uiManager.updateTimer(seconds);

// Show toast notification
uiManager.showToast('Achievement unlocked!', 'success');
```

## Event System

The UI uses a pub/sub event system for loose coupling:

### HUD Events

```javascript
// Dispatch from game code
window.dispatchEvent(new CustomEvent('hud:update:ammo', {
  detail: { current: 25, reserve: 75 }
}));

window.dispatchEvent(new CustomEvent('hud:update:health', {
  detail: { health: 80, maxHealth: 100 }
}));

window.dispatchEvent(new CustomEvent('hud:crosshair:spread', {
  detail: { spread: 5 }
}));

window.dispatchEvent(new CustomEvent('kill_feed:add', {
  detail: { killer: 'Player1', victim: 'Enemy1', weapon: 'AR', isHeadshot: true }
}));
```

### Shop Events

```javascript
// Listen for purchases
window.addEventListener('shop:purchase', (e) => {
  const { item } = e.detail;
  // Process purchase in game logic
});
```

### Settings Events

```javascript
// Listen for settings changes
window.addEventListener('settings:changed', (e) => {
  const { settings } = e.detail;
  // Apply settings (graphics quality, audio, controls, etc.)
});
```

### Analytics Events

```javascript
// Track UI interactions
window.addEventListener('analytics:track', (e) => {
  const { event, data } = e.detail;
  // Send to analytics service
});
```

## Localization

### Using Translations

```javascript
import { i18n } from './src/ui/LocalizationManager.js';

// Get translation
const text = i18n.t('menu.play');

// With parameters
const message = i18n.t('notifications.level_up', { level: 5 });
// Result: "Level Up! You are now level 5"

// Change locale
await i18n.setLocale('es-ES');
```

### Adding New Languages

1. Create a new JSON file in `src/localization/` (e.g., `es-ES.json`)
2. Copy structure from `en-US.json`
3. Translate all strings
4. Load with `i18n.loadLocale('es-ES')`

## Accessibility

### Colorblind Modes

```javascript
import { colorBlindModes } from './src/ui/Accessibility/ColorBlindModes.js';

// Set colorblind mode
colorBlindModes.setMode('protanopia');
// Options: 'none', 'protanopia', 'deuteranopia', 'tritanopia'
```

### High Contrast Mode

```javascript
document.body.classList.toggle('high-contrast', true);
```

### Text Scaling

```javascript
document.body.classList.add('text-scale-large');
// Options: 'text-scale-small', 'text-scale-normal', 'text-scale-large', 'text-scale-xlarge'
```

### Reduced Motion

```javascript
document.body.classList.toggle('reduced-motion', true);
```

### Screen Reader Announcements

```javascript
import { screenReader } from './src/ui/Accessibility/ScreenReaderAnnouncer.js';

// Announce to screen reader
screenReader.announce('Match starting in 3 seconds');

// Immediate announcement (interrupts current)
screenReader.announceImmediate('Critical: Low health!');
```

## Styling

### CSS Custom Properties

All styles use CSS custom properties (variables) defined in `theme.css`:

```css
/* Colors */
--color-primary-500: #1890ff;
--color-success-500: #38a169;
--color-danger-500: #ef4444;

/* Spacing */
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;

/* Typography */
--font-size-base: 1rem;
--font-weight-bold: 700;

/* And many more... */
```

### Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All components adapt to these breakpoints automatically.

## Component Examples

### Creating a Button

```javascript
import { Button } from './src/ui/Components/Button.js';

const button = new Button({
  label: 'Click Me',
  variant: 'primary', // primary, secondary, danger, success, ghost
  size: 'large', // small, medium, large
  icon: '▶',
  onClick: () => console.log('Clicked!')
});

container.appendChild(button.create());
```

### Creating a Modal

```javascript
import { Modal } from './src/ui/Components/Modal.js';

const modal = new Modal({
  title: 'Confirm Action',
  content: 'Are you sure you want to proceed?',
  size: 'medium',
  onClose: () => console.log('Modal closed')
});

modal.open();
```

### Creating a Toast

```javascript
import { Toast } from './src/ui/Components/Toast.js';

// Quick toast
Toast.success('Operation completed!');
Toast.error('Something went wrong');
Toast.warning('Low ammo');
Toast.info('New achievement unlocked');

// Custom toast
const toast = new Toast({
  message: 'Custom message',
  type: 'info',
  duration: 5000, // milliseconds
  position: 'top-right'
});
toast.show();
```

### Creating a Progress Bar

```javascript
import { ProgressBar } from './src/ui/Components/ProgressBar.js';

const progressBar = new ProgressBar({
  value: 50,
  max: 100,
  showLabel: true,
  animated: true,
  color: 'primary'
});

container.appendChild(progressBar.create());

// Update value
progressBar.setValue(75);
```

## Demo

Run the demo to see all components in action:

```bash
npm run dev
```

Then navigate to `http://localhost:8080/ui-demo.html`

## Testing

The UI system is designed to work standalone for easy testing:

1. **Manual Testing**: Use `ui-demo.html` to test all components
2. **Event Testing**: Dispatch custom events to test HUD updates
3. **Accessibility Testing**: Use screen readers and keyboard navigation
4. **Responsive Testing**: Resize browser or use device emulation

## Best Practices

### 1. Use UIManager for Coordination

Always go through `uiManager` rather than manipulating components directly:

```javascript
// Good
uiManager.updateHealth(80);

// Avoid
document.getElementById('health-fill').style.width = '80%';
```

### 2. Use Events for Decoupling

Dispatch events from game logic rather than calling UI methods directly:

```javascript
// Game code
window.dispatchEvent(new CustomEvent('hud:update:ammo', {
  detail: { current: 25, reserve: 75 }
}));
```

### 3. Use Localization

Always use `i18n.t()` for text:

```javascript
// Good
button.textContent = i18n.t('menu.play');

// Avoid
button.textContent = 'Play';
```

### 4. Respect Accessibility Settings

Check for user preferences:

```javascript
if (document.body.classList.contains('reduced-motion')) {
  // Skip animations
}
```

### 5. Mobile-First

Always test on mobile viewports first, then enhance for desktop.

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

## Performance

- **Minimal DOM updates**: Components cache elements
- **Event delegation**: Efficient event handling
- **CSS animations**: Hardware-accelerated
- **Lazy loading**: Menus loaded on demand
- **No framework overhead**: Pure JavaScript

## Security

- **No inline styles**: All styles in CSS files
- **CSP compatible**: No `eval()` or inline scripts
- **XSS prevention**: Safe DOM manipulation
- **Input validation**: All user inputs sanitized

## License

See project LICENSE file.
