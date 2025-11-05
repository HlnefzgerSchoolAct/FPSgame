// Main entry point for the FPS game

window.addEventListener('DOMContentLoaded', () => {
    try {
        // Create and initialize game engine
        const game = new GameEngine();
        game.init();
        game.start();
        
        // Make game accessible globally for UI callbacks
        window.gameInstance = game;
        
        console.log('FPS Game initialized successfully!');
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('Failed to initialize game. Please check the console for details.');
    }
});
