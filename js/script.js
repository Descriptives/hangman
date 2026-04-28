document.addEventListener('DOMContentLoaded', function() {
    // Check if wordList exists
    if (typeof wordList === 'undefined') {
        console.error("wordList is not defined! Make sure wordlist.js is loaded correctly.");
        return;
    }

    const wordDisplay = document.querySelector(".word");
    const keyboardDiv = document.querySelector(".keyboard");
    const hintText = document.querySelector(".hint b");
    const missDisplay = document.querySelector(".guess b");
    const hangmanImage = document.getElementById("hangman-image");
    const gameOverModal = document.getElementById("gameOverModal");
    const resultMessage = document.getElementById("result-message");
    const resultImage = document.getElementById("result-image");
    const streakMessage = document.getElementById("streakMessage");
    const playAgainBtn = document.getElementById("playAgainBtn");
    const freeLetterBtn = document.getElementById("freeLetterBtn");
    const freeLetterCount = document.getElementById("freeLetterCount");
    const homeBtn = document.getElementById("homeBtn");
    const backFromGameBtn = document.getElementById("backFromGameBtn");
    const refreshBtn = document.getElementById("refreshBtn");
    
    const categorySelect = document.getElementById("categorySelect");
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsMenu = document.getElementById("settingsMenu");
    const bgMusic = document.getElementById("bgMusic");
    const musicToggleBtn = document.getElementById("musicToggleBtn");
    const volumeSlider = document.getElementById("volumeSlider");
    const bgButtons = document.querySelectorAll(".bg-btn");

    // Counter elements
    const currentWordNum = document.getElementById("currentWordNum");
    const totalWordsSpan = document.getElementById("totalWords");
    const guessedCount = document.getElementById("guessedCount");
    const remainingCount = document.getElementById("remainingCount");
    const timerDisplay = document.getElementById("timerDisplay");

    // Dashboard elements
    const dashboardStreak = document.getElementById("dashboardStreak");
    const dashboardFreeLetters = document.getElementById("dashboardFreeLetters");
    const dashboardBestStreak = document.getElementById("dashboardBestStreak");
    const howToPlayBtn = document.getElementById("howToPlayBtn");
    const statsBtn = document.getElementById("statsBtn");

    let currentWord = "";
    let correctLetters = [];
    let wrongCount = 0;
    let gameActive = true;
    let freeLettersLeft = 3;
    let currentStreak = 0;
    let highestStreak = 0;
    let currentWordIndex = 0;
    const maxWrong = 6;
    let keyboardButtons = {};
    let isMusicPlaying = localStorage.getItem("hangman_music_playing") === "true";
    
    // Timer variables
    let seconds = 0;
    let timerInterval;

    // Store current settings
    let currentBackground = localStorage.getItem("hangman_background") || "url('./hangman-game-images/images/cityBackground.jpg')";
    let currentVolume = localStorage.getItem("hangman_music_volume") || "0.3";
    let currentMusicState = localStorage.getItem("hangman_music_playing") === "true";

    // ========== TIMER FUNCTIONS ==========
    function startTimer() {
        stopTimer();
        timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            if (timerDisplay) {
                timerDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function resetTimer() {
        stopTimer();
        seconds = 0;
        if (timerDisplay) timerDisplay.textContent = '00:00';
        startTimer();
    }

    // ========== COUNTER FUNCTIONS ==========
    function updateWordCounter() {
        if (currentWordNum && totalWordsSpan && wordList) {
            currentWordNum.textContent = currentWordIndex + 1;
            totalWordsSpan.textContent = wordList.length;
        }
    }

    function updateCounters() {
        if (guessedCount) guessedCount.textContent = correctLetters.length;
        if (remainingCount && currentWord) {
            const uniqueLetters = [...new Set(currentWord.split(''))];
            remainingCount.textContent = uniqueLetters.length - correctLetters.length;
        }
    }

    function updateDashboardStats() {
        if (dashboardStreak) dashboardStreak.textContent = currentStreak;
        if (dashboardFreeLetters) dashboardFreeLetters.textContent = freeLettersLeft;
        if (dashboardBestStreak) dashboardBestStreak.textContent = highestStreak;
    }

    // ========== SETTINGS FUNCTIONS ==========
    if (settingsBtn && settingsMenu) {
        settingsBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            settingsMenu.style.display = settingsMenu.style.display === "none" ? "block" : "none";
        });

        document.addEventListener("click", (e) => {
            if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
                settingsMenu.style.display = "none";
            }
        });
    }

    // Music setup
    function initMusic() {
        if (bgMusic && volumeSlider) {
            bgMusic.volume = parseFloat(currentVolume);
            volumeSlider.value = currentVolume;
            
            if (currentMusicState) {
                musicToggleBtn.innerText = "🎵";
                bgMusic.play().catch(e => {
                    console.log("Audio play failed:", e);
                    currentMusicState = false;
                    musicToggleBtn.innerText = "🔇";
                    localStorage.setItem("hangman_music_playing", "false");
                });
            } else {
                musicToggleBtn.innerText = "🔇";
            }
        }
    }

    if (musicToggleBtn && bgMusic) {
        musicToggleBtn.addEventListener("click", () => {
            if (currentMusicState) {
                bgMusic.pause();
                musicToggleBtn.innerText = "🔇";
                currentMusicState = false;
            } else {
                bgMusic.play().catch(e => console.log("Audio play failed:", e));
                musicToggleBtn.innerText = "🎵";
                currentMusicState = true;
            }
            localStorage.setItem("hangman_music_playing", currentMusicState);
        });
    }

    if (volumeSlider && bgMusic) {
        volumeSlider.addEventListener("input", (e) => {
            const volume = parseFloat(e.target.value);
            bgMusic.volume = volume;
            currentVolume = volume;
            localStorage.setItem("hangman_music_volume", volume);
            if (volume === 0) {
                musicToggleBtn.innerText = "🔇";
            } else if (currentMusicState) {
                musicToggleBtn.innerText = "🎵";
            }
        });
    }

    // Background changer
    function applyBackground(bgValue) {
        currentBackground = bgValue;
        document.body.style.backgroundImage = bgValue;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundPosition = "center";
        document.body.style.backgroundRepeat = "no-repeat";
        document.body.style.backgroundAttachment = "fixed";
        localStorage.setItem("hangman_background", bgValue);
    }

    if (bgButtons) {
        bgButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const newBg = e.target.getAttribute("data-bg");
                applyBackground(newBg);
            });
        });
    }

    // ========== GAME FUNCTIONS ==========
    function loadSavedData() {
        const savedStreak = localStorage.getItem('hangman_streak');
        const savedFreeLetters = localStorage.getItem('hangman_freeLetters');
        const savedHighestStreak = localStorage.getItem('hangman_highestStreak');
        const savedBg = localStorage.getItem('hangman_background');

        if (savedStreak) currentStreak = parseInt(savedStreak);
        if (savedFreeLetters) freeLettersLeft = parseInt(savedFreeLetters);
        if (savedHighestStreak) highestStreak = parseInt(savedHighestStreak);
        if (savedBg) {
            currentBackground = savedBg;
            applyBackground(savedBg);
        }
        
        updateDashboardStats();
        updateFreeLetterButton();
    }

    function saveData() {
        localStorage.setItem('hangman_streak', currentStreak.toString());
        localStorage.setItem('hangman_freeLetters', freeLettersLeft.toString());
        localStorage.setItem('hangman_highestStreak', highestStreak.toString());
        updateDashboardStats();
    }

    function goBackHome() {
        saveData();
        stopTimer();
        window.location.href = 'index.html';
    }

    function refreshGame() {
        // Save current settings
        localStorage.setItem('hangman_music_playing', currentMusicState);
        localStorage.setItem('hangman_music_volume', currentVolume);
        localStorage.setItem('hangman_background', currentBackground);
        
        // Save game data
        saveData();
        
        // Reload the page
        window.location.reload();
    }

    function updateFreeLetterButton() {
        if (freeLetterBtn && freeLetterCount) {
            freeLetterCount.innerText = freeLettersLeft;
            if (freeLettersLeft <= 0) {
                freeLetterBtn.style.opacity = "0.5";
                freeLetterBtn.style.cursor = "not-allowed";
                freeLetterBtn.disabled = true;
            } else {
                freeLetterBtn.style.opacity = "1";
                freeLetterBtn.style.cursor = "pointer";
                freeLetterBtn.disabled = false;
            }
        }
    }

    function useFreeLetter() {
        if (!gameActive) return;
        if (freeLettersLeft <= 0) {
            alert("No free letters left! Win games to earn more!");
            return;
        }

        const wordLetters = [...new Set(currentWord.split(''))];
        const unguessedLetters = wordLetters.filter(letter => !correctLetters.includes(letter));
        
        if (unguessedLetters.length === 0) {
            alert("All letters are already revealed!");
            return;
        }

        freeLettersLeft--;
        updateFreeLetterButton();
        saveData();

        const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
        
        const boxes = wordDisplay.querySelectorAll(".letter-box");
        [...currentWord].forEach((char, index) => {
            if (char === randomLetter) {
                boxes[index].innerText = randomLetter.toUpperCase();
            }
        });
        
        if (!correctLetters.includes(randomLetter)) {
            correctLetters.push(randomLetter);
        }
        
        if (keyboardButtons[randomLetter]) {
            keyboardButtons[randomLetter].disabled = true;
        }

        updateCounters();
        checkWinCondition();
    }

    function updateHangmanImage() {
        if (hangmanImage) {
            hangmanImage.src = `../hangman-game-images/images/hangman-${wrongCount}.svg`;
        }
    }

    function showGameOver(isWin) {
        gameActive = false;
        stopTimer();
        
        if (gameOverModal) {
            if (isWin) {
                let bonusLetters = 1;
                let bonusMessage = "🎁 +1 Free Letter";
                
                currentStreak++;
                if (currentStreak > highestStreak) {
                    highestStreak = currentStreak;
                }
                
                if (currentStreak === 3) {
                    bonusLetters += 1;
                    bonusMessage = "🔥 3 IN A ROW! +2 Free Letters!";
                } else if (currentStreak === 5) {
                    bonusLetters += 2;
                    bonusMessage = "🔥🔥 5 IN A ROW! +3 Free Letters!";
                } else if (currentStreak === 10) {
                    bonusLetters += 3;
                    bonusMessage = "🔥🔥🔥 10 IN A ROW! +4 Free Letters!";
                } else if (currentStreak % 5 === 0 && currentStreak > 0) {
                    bonusLetters += 1;
                    bonusMessage = `🔥 ${currentStreak} STREAK! +2 Free Letters!`;
                }
                
                if (wrongCount === 0) {
                    bonusLetters += 1;
                    bonusMessage += " 🌟 Perfect Game! Extra +1!";
                }
                
                freeLettersLeft += bonusLetters;
                updateFreeLetterButton();
                
                if (streakMessage) streakMessage.innerHTML = bonusMessage;
                if (resultMessage) resultMessage.innerText = "🎉 YOU WIN!";
                if (resultImage) resultImage.src = "../hangman-game-images/images/victory.gif";
                
                saveData();
            } else {
                if (currentStreak > 0) {
                    if (currentStreak >= 5) {
                        if (streakMessage) streakMessage.innerHTML = `💔 Lost at ${currentStreak} streak! That was impressive!`;
                    } else if (currentStreak >= 3) {
                        if (streakMessage) streakMessage.innerHTML = `💔 Lost at ${currentStreak} streak! Good run!`;
                    } else {
                        if (streakMessage) streakMessage.innerHTML = `💔 Lost at ${currentStreak} streak! Try again!`;
                    }
                } else {
                    if (streakMessage) streakMessage.innerHTML = "💪 Keep trying! You'll get it!";
                }
                
                currentStreak = 0;
                if (resultMessage) resultMessage.innerText = `💀 Game Over!`;
                if (resultImage) resultImage.src = "./hangman-game-images/images/lost.gif";
                
                saveData();
            }
            
            gameOverModal.style.display = "flex";
            gameOverModal.focus();
        }
    }

    function hideGameOver() {
        if (gameOverModal) {
            gameOverModal.style.display = "none";
        }
    }

    function checkWinCondition() {
        if (!currentWord) return;
        
        const uniqueWordLetters = [...new Set(currentWord.split(''))];
        const allLettersGuessed = uniqueWordLetters.every(letter => 
            correctLetters.includes(letter)
        );

        if (allLettersGuessed) {
            Object.values(keyboardButtons).forEach(btn => {
                if (btn) btn.disabled = true;
            });
            showGameOver(true);
        }
    }

    function handleLetter(letter, button) {
        if (!gameActive || !currentWord) return;
        
        letter = letter.toLowerCase();
        
        if (button && button.disabled) return;
        
        if (button) {
            button.disabled = true;
        }

        if (currentWord.includes(letter)) {
            const boxes = wordDisplay.querySelectorAll(".letter-box");
            [...currentWord].forEach((char, index) => {
                if (char === letter) {
                    boxes[index].innerText = letter.toUpperCase();
                }
            });
            
            if (!correctLetters.includes(letter)) {
                correctLetters.push(letter);
            }

            updateCounters();
            checkWinCondition();
        } else {
            wrongCount++;
            if (missDisplay) {
                missDisplay.innerText = `${wrongCount} / ${maxWrong}`;
            }
            updateHangmanImage();
        }

        if (wrongCount >= maxWrong) {
            Object.values(keyboardButtons).forEach(btn => {
                if (btn) btn.disabled = true;
            });
            showGameOver(false);
        }
    }

    function handleKeyPress(e) {
        const key = e.key.toLowerCase();
        
        if (key === 'escape') {
            goBackHome();
            return;
        }
        
        if (key === 'enter') {
            if (gameOverModal && gameOverModal.style.display === 'flex') {
                e.preventDefault();
                resetGame();
                return;
            }
        }
        
        if (key === 'f5' || (key === 'r' && e.ctrlKey)) {
            e.preventDefault();
            refreshGame();
            return;
        }
        
        if (!gameActive) return;
        
        if (key.length === 1 && key >= 'a' && key <= 'z') {
            e.preventDefault();
            const button = keyboardButtons[key];
            handleLetter(key, button);
        }
    }

    function generateKeyboard() {
        if (!keyboardDiv) return;
        
        keyboardDiv.innerHTML = "";
        keyboardButtons = {};
        
        for (let i = 97; i <= 122; i++) {
            const button = document.createElement("button");
            const letter = String.fromCharCode(i);
            button.innerText = letter.toUpperCase();
            
            keyboardButtons[letter] = button;
            
            button.addEventListener("click", () => handleLetter(letter, button));
            keyboardDiv.appendChild(button);
        }
    }

    function getRandomWord() {
        if (!wordList || wordList.length === 0) {
            console.error("wordList is not defined or empty!");
            return;
        }

        const selectedCategory = categorySelect ? categorySelect.value : "all";
        let filteredList = wordList;
        
        if (selectedCategory !== "all") {
            filteredList = wordList.filter(item => item.category === selectedCategory);
        }

        if (filteredList.length === 0) {
            filteredList = wordList;
        }

        const randomIndex = Math.floor(Math.random() * filteredList.length);
        const { word, hint } = filteredList[randomIndex];

        currentWord = word.toLowerCase();
        currentWordIndex = randomIndex;
        
        if (hintText) {
            hintText.innerText = hint;
        }
        
        correctLetters = [];
        wrongCount = 0;
        gameActive = true;
        
        updateHangmanImage();
        updateWordCounter();
        updateCounters();
        updateDashboardStats();
        resetTimer();
        
        if (missDisplay) {
            missDisplay.innerText = `${wrongCount} / ${maxWrong}`;
        }

        if (wordDisplay) {
            wordDisplay.innerHTML = currentWord
                .split("")
                .map(() => `<li class="letter-box"></li>`)
                .join("");
        }

        // Re-enable all keyboard buttons
        Object.values(keyboardButtons).forEach(btn => {
            if (btn) btn.disabled = false;
        });

        hideGameOver();
        updateFreeLetterButton();
    }

    function resetGame() {
        getRandomWord();
    }

    // ========== EVENT LISTENERS ==========
    if (playAgainBtn) {
        playAgainBtn.addEventListener("click", resetGame);
    }

    if (freeLetterBtn) {
        freeLetterBtn.addEventListener("click", useFreeLetter);
    }

    if (homeBtn) {
        homeBtn.addEventListener("click", goBackHome);
    }

    if (backFromGameBtn) {
        backFromGameBtn.addEventListener("click", goBackHome);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener("click", refreshGame);
    }

    if (categorySelect) {
        categorySelect.addEventListener("change", resetGame);
    }

    if (howToPlayBtn) {
        howToPlayBtn.addEventListener("click", () => {
            alert("How to Play:\n\n1. Guess letters to find the hidden word\n2. You have 6 wrong guesses allowed\n3. Use Free Letters to reveal random letters\n4. Build streaks to earn bonus free letters!\n5. Complete words to continue your streak!");
        });
    }
    
    if (statsBtn) {
        statsBtn.addEventListener("click", () => {
            alert(`📊 Your Statistics:\n\n• Current Streak: ${currentStreak}\n• Best Streak: ${highestStreak}\n• Free Letters Left: ${freeLettersLeft}`);
        });
    }

    document.addEventListener('keydown', handleKeyPress);

    if (gameOverModal) {
        gameOverModal.setAttribute('tabindex', '-1');
    }

    // ========== INITIALIZE GAME ==========
    generateKeyboard();
    loadSavedData();
    initMusic();
    getRandomWord();
    if (totalWordsSpan && wordList) totalWordsSpan.textContent = wordList.length;
});