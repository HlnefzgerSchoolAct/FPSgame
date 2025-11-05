// UI Manager

class UIManager {
    constructor() {
        this.elements = {};
        this.currentMenu = 'main';
    }
    
    init() {
        // Get all UI elements
        this.elements = {
            // HUD
            healthFill: document.getElementById('health-fill'),
            healthText: document.getElementById('health-text'),
            ammoCurrent: document.getElementById('ammo-current'),
            ammoReserve: document.getElementById('ammo-reserve'),
            weaponName: document.getElementById('weapon-name'),
            killCount: document.getElementById('kill-count'),
            waveCount: document.getElementById('wave-count'),
            scoreValue: document.getElementById('score-value'),
            fpsValue: document.getElementById('fps-value'),
            hitmarker: document.getElementById('hitmarker'),
            damageOverlay: document.getElementById('damage-overlay'),
            
            // Menus
            mainMenu: document.getElementById('main-menu'),
            pauseMenu: document.getElementById('pause-menu'),
            gameoverMenu: document.getElementById('gameover-menu'),
            controlsMenu: document.getElementById('controls-menu'),
            settingsMenu: document.getElementById('settings-menu'),
            
            // Buttons
            startButton: document.getElementById('start-button'),
            continueButton: document.getElementById('continue-button'),
            resumeButton: document.getElementById('resume-button'),
            retryButton: document.getElementById('retry-button'),
            
            // Final stats
            finalScore: document.getElementById('final-score'),
            finalKills: document.getElementById('final-kills'),
            finalWave: document.getElementById('final-wave'),
            finalAccuracy: document.getElementById('final-accuracy')
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Main menu
        this.elements.startButton.addEventListener('click', () => {
            window.gameInstance.startGame();
        });
        
        document.getElementById('controls-button').addEventListener('click', () => {
            this.showMenu('controls');
        });
        
        document.getElementById('settings-button').addEventListener('click', () => {
            this.showMenu('settings');
        });
        
        // Pause menu
        this.elements.resumeButton.addEventListener('click', () => {
            window.gameInstance.resumeGame();
        });
        
        document.getElementById('quit-button').addEventListener('click', () => {
            window.gameInstance.quitToMenu();
        });
        
        // Game over
        this.elements.retryButton.addEventListener('click', () => {
            window.gameInstance.restartGame();
        });
        
        document.getElementById('menu-button').addEventListener('click', () => {
            window.gameInstance.quitToMenu();
        });
        
        // Back buttons
        document.getElementById('back-button').addEventListener('click', () => {
            this.showMenu('main');
        });
        
        document.getElementById('settings-back-button').addEventListener('click', () => {
            this.showMenu('main');
        });
        
        // Settings sliders
        const sensitivitySlider = document.getElementById('sensitivity-slider');
        sensitivitySlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('sensitivity-value').textContent = value.toFixed(1);
            if (window.gameInstance && window.gameInstance.player) {
                window.gameInstance.player.mouseSensitivity = value * 0.002;
            }
        });
        
        const masterVolumeSlider = document.getElementById('master-volume-slider');
        masterVolumeSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('master-volume-value').textContent = Math.round(value * 100) + '%';
            if (window.gameInstance && window.gameInstance.audio) {
                window.gameInstance.audio.setMasterVolume(value);
            }
        });
    }
    
    updateHUD(player, weaponManager, gameState) {
        // Update health
        const healthPercent = (player.health / player.maxHealth) * 100;
        this.elements.healthFill.style.width = healthPercent + '%';
        this.elements.healthText.textContent = Math.ceil(player.health);
        
        // Update ammo
        const weapon = weaponManager.getCurrentWeapon();
        this.elements.ammoCurrent.textContent = weapon.currentAmmo;
        this.elements.ammoReserve.textContent = weapon.reserveAmmo;
        this.elements.weaponName.textContent = weapon.name;
        
        // Update score
        this.elements.killCount.textContent = gameState.kills;
        this.elements.waveCount.textContent = gameState.wave;
        this.elements.scoreValue.textContent = gameState.score;
        
        // Update FPS
        this.elements.fpsValue.textContent = Performance.fps;
    }
    
    showHitmarker() {
        this.elements.hitmarker.classList.add('show');
        setTimeout(() => {
            this.elements.hitmarker.classList.remove('show');
        }, 100);
    }
    
    showDamage() {
        this.elements.damageOverlay.style.opacity = '0.5';
        setTimeout(() => {
            this.elements.damageOverlay.style.opacity = '0';
        }, 200);
    }
    
    showMenu(menuName) {
        // Hide all menus
        Object.keys(this.elements).forEach(key => {
            if (key.includes('Menu')) {
                this.elements[key].classList.remove('active');
            }
        });
        
        // Show requested menu
        const menuElement = this.elements[menuName + 'Menu'];
        if (menuElement) {
            menuElement.classList.add('active');
            this.currentMenu = menuName;
        }
    }
    
    hideAllMenus() {
        Object.keys(this.elements).forEach(key => {
            if (key.includes('Menu')) {
                this.elements[key].classList.remove('active');
            }
        });
    }
    
    showGameOver(stats) {
        this.elements.finalScore.textContent = stats.score;
        this.elements.finalKills.textContent = stats.kills;
        this.elements.finalWave.textContent = stats.wave;
        this.elements.finalAccuracy.textContent = stats.accuracy.toFixed(1);
        this.showMenu('gameover');
    }
}
