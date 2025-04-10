// Fixed: Added error handling and proper path references
async function loadGames() {
    try {
        const response = await fetch('/api/games'); // Removed hardcoded localhost
        if (!response.ok) throw new Error('Network response was not ok');
        
        const games = await response.json();
        const container = document.querySelector('.js-game-container');
        
        container.innerHTML = games.map(game => `
            <div class="game-card" data-game="${game.name}">
                <img src="/uploads/${game.name}/${game.image}" 
                     alt="${game.name}"
                     onerror="this.onerror=null;this.src='/uploads/default.jpg'">
                <p>${game.name}</p>
                <button class="play-btn">Play</button>
                <button class="info-btn">Info</button>
            </div>
        `).join('');
        
        // Add event listeners after DOM is created
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', () => playGame(btn.closest('.game-card').dataset.game));
        });
        
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', () => showGameInfo(btn.closest('.game-card').dataset.game));
        });
        
    } catch (error) {
        console.error('Error loading games:', error);
        document.querySelector('.js-game-container').innerHTML = `
            <div class="error">Failed to load games. Please refresh the page.</div>
        `;
    }
}

// Initialize when DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGames);
} else {
    loadGames();
}
