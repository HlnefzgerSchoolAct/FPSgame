// Audio Manager for the FPS game

class AudioManager {
    constructor() {
        this.context = null;
        this.masterVolume = 1.0;
        this.sfxVolume = 1.0;
        this.musicVolume = 0.5;
        this.sounds = new Map();
    }
    
    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }
    
    // Generate simple sound effects using oscillators
    playShoot() {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = 200;
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.1);
    }
    
    playReload() {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.setValueAtTime(400, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.context.currentTime + 0.5);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.5);
    }
    
    playHit() {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = 100;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.4 * this.sfxVolume * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.15);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.15);
    }
    
    playEnemyDeath() {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.setValueAtTime(300, this.context.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.5);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.5);
    }
    
    playDamage() {
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = 150;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
        
        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + 0.2);
    }
    
    setMasterVolume(volume) {
        this.masterVolume = MathUtils.clamp(volume, 0, 1);
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = MathUtils.clamp(volume, 0, 1);
    }
    
    setMusicVolume(volume) {
        this.musicVolume = MathUtils.clamp(volume, 0, 1);
    }
}
