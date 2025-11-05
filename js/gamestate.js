// Game State Management

class GameState {
    constructor() {
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.accuracy = 0;
        
        this.state = 'menu'; // menu, playing, paused, gameover
        this.waveTimer = 0;
        this.waveDuration = 30;
        this.isWaveActive = false;
    }
    
    reset() {
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.accuracy = 0;
        this.waveTimer = 0;
        this.isWaveActive = false;
    }
    
    addKill() {
        this.kills++;
        this.score += 100 * this.wave;
    }
    
    recordShot(hit) {
        this.shotsFired++;
        if (hit) {
            this.shotsHit++;
        }
        this.accuracy = this.shotsFired > 0 ? (this.shotsHit / this.shotsFired) * 100 : 0;
    }
    
    update(deltaTime) {
        if (this.state === 'playing') {
            this.waveTimer += deltaTime;
            
            // Start new wave every waveDuration seconds
            if (this.waveTimer >= this.waveDuration) {
                this.wave++;
                this.waveTimer = 0;
            }
        }
    }
    
    getFinalStats() {
        return {
            score: this.score,
            kills: this.kills,
            wave: this.wave,
            accuracy: this.accuracy
        };
    }
}
