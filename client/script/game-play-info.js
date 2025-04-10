// Fixed: Added proper escaping for HTML and better error handling
function playGame(gameName) {
    if (!gameName) {
        console.error('No game name provided');
        return;
    }
    window.open(`/uploads/${encodeURIComponent(gameName)}/index.html`, '_blank');
}

function showGameInfo(gameName) {
    if (!gameName) {
        console.error('No game name provided');
        return;
    }
    
    const gamesSection = document.querySelector('.games-section');
    if (!gamesSection) return;
    
    gamesSection.innerHTML = `
        <div class="info-view">
            <h2>${escapeHtml(gameName)}</h2>
            <button class="play-btn">Play Now</button>
            <button class="back-btn">Back to Games</button>
        </div>
    `;
    
    // Add event listeners
    gamesSection.querySelector('.play-btn').addEventListener('click', () => playGame(gameName));
    gamesSection.querySelector('.back-btn').addEventListener('click', () => location.reload());
}

// Helper function to prevent XSS
function escapeHtml(unsafe) {
    return unsafe.replace(/[&<"'>]/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
}
