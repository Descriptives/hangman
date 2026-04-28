// Load stats
function loadHomeStats() {
    const streak = localStorage.getItem('hangman_streak') || '0';
    const freeLetters = localStorage.getItem('hangman_freeLetters') || '3';
    const highestStreak = localStorage.getItem('hangman_highestStreak') || '0';
    
    document.getElementById('homeStats').innerHTML = `
        <div class="stat-item">
            <span class="stat-label">🔥 STREAK</span>
            <span class="stat-value" style="color: #ffaa00;">${streak}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">🎁 FREE</span>
            <span class="stat-value" style="color: #4CAF50;">${freeLetters}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">👑 BEST</span>
            <span class="stat-value" style="color: #ff4444;">${highestStreak}</span>
        </div>
    `;
}

// Start game with loading
function startGame() {
    const btn = document.getElementById('startGameBtn');
    const overlay = document.getElementById('loadingOverlay');
    
    btn.classList.add('loading');
    overlay.classList.add('active');
    
    setTimeout(() => {
        window.location.href = 'gamepage.html';
    }, 600);
}

// Quit to website
function quitToWebsite() {
    window.location.href = '../index.html';
}

// Settings functionality
function setupSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsModal');
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggleBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    let isPlaying = localStorage.getItem('hangman_music_playing') === 'true';
    
    // Open settings modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
    });
    
    // Close settings modal
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
    });
    
    // Close when clicking outside
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
    
    // Music setup
    if (bgMusic) {
        const savedVolume = localStorage.getItem('hangman_music_volume');
        if (savedVolume) volumeSlider.value = savedVolume;
        bgMusic.volume = volumeSlider.value;
        
        if (isPlaying) {
            bgMusic.play().catch(() => {
                isPlaying = false;
                musicToggle.textContent = '🔇';
                localStorage.setItem('hangman_music_playing', 'false');
            });
            musicToggle.textContent = '🎵';
        }
    }
    
    // Music toggle
    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicToggle.textContent = '🔇';
        } else {
            bgMusic.play().catch(e => console.log('Audio error:', e));
            musicToggle.textContent = '🎵';
        }
        isPlaying = !isPlaying;
        localStorage.setItem('hangman_music_playing', isPlaying);
    });
    
    // Volume control
    volumeSlider.addEventListener('input', (e) => {
        bgMusic.volume = e.target.value;
        localStorage.setItem('hangman_music_volume', e.target.value);
    });
    
    // Background change
    document.querySelectorAll('.bg-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bg = e.target.dataset.bg;
            document.body.style.background = bg;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            localStorage.setItem('hangman_background', bg);
        });
    });
    
    // Load saved background
    const savedBg = localStorage.getItem('hangman_background');
    if (savedBg) {
        document.body.style.background = savedBg;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHomeStats();
    
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('quitBtn').addEventListener('click', quitToWebsite);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') startGame();
        if (e.key === 'Escape') {
            document.getElementById('settingsModal').classList.remove('active');
        }
    });
    
    setupSettings();
});