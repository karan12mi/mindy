async function loadGames() {
    try {
        const response = await fetch('http://localhost:3000/api/games');
        if (!response.ok) throw new Error('Network response was not ok');
        const games = await response.json();
        
        const container = document.querySelector('.js-game-container');
        container.innerHTML = games.map(game => `
            <div class="game-card">
                <img src="/uploads/${game.name}/${game.image}" 
                     alt="${game.name}"
                     onerror="this.src='/uploads/default.jpg'">
                <p>${game.name}</p>
                <button class="play-btn" onclick="playGame('${game.name}')">Play</button>
                <button class="info-btn" onclick="showGameInfo('${game.name}', '${game.image}')">Info</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading games:', error);
        document.querySelector('.js-game-container').innerHTML = `
            <div class="error-message">Failed to load games. Please try again later.</div>
        `;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadGames);