function playGame(gameName) {
    window.open(`/uploads/${gameName}/index.html`, '_blank');
}

function showGameInfo(gameName, image) {
    const gamesSection = document.querySelector('.games-section');
    gamesSection.innerHTML = `
        <div class="info-view">
            <img src="/uploads/${gameName}/${image}" alt="${gameName}">
            <h2>${gameName}</h2>
            <button class="play-btn" onclick="playGame('${gameName}')">Play Now</button>
            <button class="back-btn" onclick="window.location.reload()">Back to Games</button>
        </div>
    `;
}