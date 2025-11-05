/**
 * GameState - Manages game state transitions (menu -> playing -> paused -> gameover)
 */
export class GameState {
  constructor() {
    this.state = 'menu'; // 'menu', 'playing', 'paused', 'gameover'
    this.previousState = null;
    this.stateData = {};
    this.listeners = {};
  }
  
  setState(newState, data = {}) {
    if (this.state === newState) return;
    
    const oldState = this.state;
    this.previousState = oldState;
    this.state = newState;
    this.stateData = { ...this.stateData, ...data };
    
    // Emit state change event
    this._emit('stateChange', {
      from: oldState,
      to: newState,
      data: this.stateData
    });
    
    // Emit specific state events
    this._emit(`enter:${newState}`, this.stateData);
    this._emit(`exit:${oldState}`, this.stateData);
    
    console.log(`GameState: ${oldState} -> ${newState}`);
  }
  
  getState() {
    return this.state;
  }
  
  isPlaying() {
    return this.state === 'playing';
  }
  
  isPaused() {
    return this.state === 'paused';
  }
  
  isMenu() {
    return this.state === 'menu';
  }
  
  isGameOver() {
    return this.state === 'gameover';
  }
  
  pause() {
    if (this.state === 'playing') {
      this.setState('paused');
    }
  }
  
  resume() {
    if (this.state === 'paused') {
      this.setState('playing');
    }
  }
  
  startGame(data = {}) {
    this.setState('playing', data);
  }
  
  endGame(data = {}) {
    this.setState('gameover', data);
  }
  
  returnToMenu() {
    this.setState('menu');
  }
  
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  _emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
  
  getStateData(key) {
    return key ? this.stateData[key] : this.stateData;
  }
  
  setStateData(key, value) {
    this.stateData[key] = value;
  }
}
