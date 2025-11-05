# FPS Game

A browser-based First-Person Shooter game built with HTML5, CSS3, and JavaScript featuring raycasting 3D graphics, enemy AI, weapons, and wave-based gameplay.

## Features

### Core Gameplay
- **First-Person Shooting**: Classic FPS controls with mouse look and WASD movement
- **Multiple Weapons**: Switch between Pistol, Rifle, and Shotgun with unique characteristics
- **Enemy AI**: Intelligent enemies that detect, chase, and attack the player
- **Wave System**: Increasingly difficult waves of enemies
- **Scoring System**: Track kills, accuracy, and score

### Graphics & Rendering
- **Raycasting Engine**: Wolfenstein 3D-style rendering for smooth 3D gameplay
- **Visual Effects**: Particle systems for blood splatter and bullet impacts
- **Dynamic Lighting**: Distance-based shading for depth perception
- **HUD**: Health bar, ammo counter, weapon display, and score tracking

### Audio
- **Sound Effects**: Shooting, reload, hit, and damage sounds using Web Audio API
- **Spatial Audio**: Directional sound (planned feature)

### Game Modes
- **Survival Mode**: Fight off endless waves of enemies
- **Progressive Difficulty**: Enemies get stronger with each wave

## Controls

| Action | Control |
|--------|---------|
| **Move Forward** | W |
| **Move Left** | A |
| **Move Backward** | S |
| **Move Right** | D |
| **Look Around** | Mouse |
| **Shoot** | Left Click |
| **Reload** | R |
| **Jump** | Space |
| **Sprint** | Shift |
| **Crouch** | Ctrl |
| **Weapon 1 (Pistol)** | 1 |
| **Weapon 2 (Rifle)** | 2 |
| **Weapon 3 (Shotgun)** | 3 |
| **Pause** | ESC |

## How to Play

1. **Starting the Game**
   - Open `index.html` in a modern web browser
   - Click "START GAME" from the main menu
   - Click on the game canvas to lock the mouse cursor

2. **Gameplay**
   - Use WASD to move around the level
   - Use the mouse to aim
   - Left-click to shoot enemies
   - Enemies will spawn and attack you
   - Survive as many waves as possible
   - Watch your health and ammo!

3. **Weapons**
   - **Pistol (Key 1)**: Balanced weapon with moderate damage and accuracy
   - **Rifle (Key 2)**: High fire rate and accuracy, good for multiple enemies
   - **Shotgun (Key 3)**: High damage at close range, spreads at distance

4. **Tips**
   - Keep moving to avoid enemy fire
   - Aim for headshots (center mass) for maximum damage
   - Manage your ammo - reload when safe
   - Use cover (walls) to protect yourself
   - Sprint (Shift) to reposition quickly
   - Higher waves mean tougher enemies

## System Requirements

### Minimum
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- 2GB RAM
- Basic GPU with canvas/WebGL support
- Mouse and keyboard

### Recommended
- Latest version of Chrome or Firefox
- 4GB RAM
- Dedicated GPU
- 1080p display

## Browser Compatibility

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome | ✅ | Recommended |
| Firefox | ✅ | Recommended |
| Safari | ✅ | May require permissions for audio |
| Edge | ✅ | Chromium-based versions |
| Opera | ✅ | Chromium-based versions |
| Mobile | ⚠️ | Limited support, touch controls not implemented |

## Technical Stack

- **HTML5**: Canvas API for rendering
- **CSS3**: UI styling and animations
- **JavaScript (ES6+)**: Game logic and engine
- **Web Audio API**: Sound effects
- **LocalStorage**: Save data and settings (planned)

## Project Structure

```
/FPSgame
├── index.html          # Main game page
├── AGENT_PROMPTS.md    # Development prompts for agents
├── README.md           # This file
├── /css
│   └── style.css       # Game styling and UI
├── /js
│   ├── main.js         # Entry point
│   ├── engine.js       # Core game engine and renderer
│   ├── player.js       # Player controls and physics
│   ├── weapon.js       # Weapon system
│   ├── enemy.js        # Enemy AI
│   ├── level.js        # Level/map and collision
│   ├── ui.js           # User interface
│   ├── audio.js        # Sound manager
│   ├── particles.js    # Particle effects
│   ├── gamestate.js    # Game state management
│   └── utils.js        # Utility functions
├── /assets
│   ├── /sounds         # Sound effect files (placeholder)
│   ├── /textures       # Texture files (placeholder)
│   └── /models         # 3D models (placeholder)
└── /docs
    └── DEVELOPMENT_GUIDE.md  # Technical documentation
```

## Performance

The game is optimized for smooth gameplay:
- Target: 60 FPS on mid-range hardware
- Raycasting renderer for efficient 3D graphics
- Object pooling for particles and projectiles
- Optimized collision detection
- FPS counter displayed in top-left corner

## Known Issues

1. Mobile touch controls not yet implemented
2. No save/load functionality yet
3. Audio may require user interaction on some browsers
4. Pointer lock may behave differently across browsers

## Future Enhancements

- [ ] More weapon types (sniper rifle, rocket launcher)
- [ ] Power-ups and health packs
- [ ] Multiple levels/maps
- [ ] Multiplayer support
- [ ] Better graphics (textures, sprites)
- [ ] More enemy types
- [ ] Boss enemies
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Mobile touch controls

## Contributing

This is an educational project. Feel free to fork and experiment!

## License

MIT License - Free to use and modify

## Credits

Created as a demonstration of browser-based FPS game development using modern web technologies.

---

**Have fun and good luck surviving the waves!** 🎮
