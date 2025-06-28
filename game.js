let score = 0;
let lives = 3;
let combo = 1;
let comboTimer = null;
let multiplier = 1;
let active = false;
let paused = false;
let gameStarted = false;
let freezeTime = false;
let targetsTimeout = null;
let powerupTimeout = null;
let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");

const gameArea = document.getElementById("gameArea");
const scoreBoard = document.getElementById("scoreBoard");
const gameOver = document.getElementById("gameOver");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const clickSound = document.getElementById("clickSound");
const missSound = document.getElementById("missSound");
const powerupSound = document.getElementById("powerupSound");

function randomPos(max) {
    return Math.floor(Math.random() * (max - 50));
}

function playSound(audio) {
    audio.currentTime = 0;
    audio.play();
}

function spawnTarget() {
    if (lives <= 0 || paused || freezeTime) return;
    active = true;
    let target = document.createElement("img");
    target.src = "supermario.png";
    target.alt = "target";
    target.style.width = "50px";
    target.style.height = "50px";
    target.style.position = "absolute";
    target.style.cursor = "pointer";
    target.style.left = randomPos(gameArea.clientWidth) + "px";
    target.style.top = randomPos(gameArea.clientHeight) + "px";
    target.style.userSelect = "none";
    target.draggable = false;
    target.className = "target";
    gameArea.appendChild(target);

    let clicked = false;
    target.onclick = function() {
        if (!clicked && !paused && !freezeTime) {
            playSound(clickSound);
             // Play effect music
            const effectMusic = document.getElementById('effectMusic');
             effectMusic.currentTime = 0;
             effectMusic.play();
            score += 1 * multiplier;
            combo++;
            if (combo > 1) multiplier = Math.min(5, multiplier + 1);
            updateScore();
            clicked = true;
            active = false;
            target.style.transform = "scale(1.3)";
            setTimeout(() => target.remove(), 150);
            resetComboTimer();
            targetsTimeout = setTimeout(spawnTarget, Math.max(400, 1200 - score * 10));
        }
    };

    targetsTimeout = setTimeout(() => {
        if (!clicked && !paused && !freezeTime) {
            playSound(missSound);
            lives--;
            combo = 1;
            multiplier = 1;
            updateScore();
            active = false;
            target.style.opacity = "0.3";
            setTimeout(() => target.remove(), 150);
            if (lives > 0) targetsTimeout = setTimeout(spawnTarget, Math.max(400, 1200 - score * 10));
            else showGameOver();
        }
    }, Math.max(700, 1300 - score * 10));
}

function spawnPowerup() {
    if (lives <= 0 || paused || freezeTime) return;
    let type = Math.random() < 0.5 ? "freeze" : "life";
    let powerup = document.createElement("div");
    powerup.className = "powerup";
    powerup.style.width = "40px";
    powerup.style.height = "40px";
    powerup.style.position = "absolute";
    powerup.style.left = randomPos(gameArea.clientWidth) + "px";
    powerup.style.top = randomPos(gameArea.clientHeight) + "px";
    powerup.style.background = type === "freeze" ? "deepskyblue" : "gold";
    powerup.style.borderRadius = "50%";
    powerup.style.display = "flex";
    powerup.style.alignItems = "center";
    powerup.style.justifyContent = "center";
    powerup.style.fontWeight = "bold";
    powerup.style.color = "#222";
    powerup.style.fontSize = "1.3em";
    powerup.style.zIndex = 2;
    powerup.textContent = type === "freeze" ? "❄️" : "❤️";
    gameArea.appendChild(powerup);

    let used = false;
    powerup.onclick = function() {
        if (used) return;
        playSound(powerupSound);
        if (type === "freeze") {
            freezeTime = true;
            setTimeout(() => {
                freezeTime = false;
                spawnTarget();
            }, 2000);
        } else if (type === "life") {
            lives++;
            updateScore();
        }
        used = true;
        powerup.remove();
    };

    powerupTimeout = setTimeout(() => {
        if (!used) powerup.remove();
    }, 2000 + Math.random() * 2000);
}

function updateScore() {
    scoreBoard.textContent = `Score: ${score} | Lives: ${lives} | Combo: ${multiplier}x`;
}

function showGameOver() {
    saveLeaderboard();
    displayLeaderboard();
    gameOver.style.display = "flex";
}

function resetComboTimer() {
    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(() => {
        combo = 1;
        multiplier = 1;
        updateScore();
    }, 2000);
}

function saveLeaderboard() {
    leaderboard.push(score);
    leaderboard = leaderboard.sort((a, b) => b - a).slice(0, 5);
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    const lb = document.getElementById("leaderboard");
    lb.innerHTML = "<h3>Leaderboard</h3>" + leaderboard.map((s, i) => `<div>${i + 1}. ${s}</div>`).join("");
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    score = 0;
    lives = 3;
    combo = 1;
    multiplier = 1;
    updateScore();
    gameOver.style.display = "none";
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    spawnTarget();
    spawnPowerupLoop();
}

function pauseGame() {
    paused = true;
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
    if (targetsTimeout) clearTimeout(targetsTimeout);
    if (powerupTimeout) clearTimeout(powerupTimeout);
}

function resumeGame() {
    paused = false;
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
    if (!active) spawnTarget();
    spawnPowerupLoop();
}

function spawnPowerupLoop() {
    if (lives <= 0 || paused) return;
    spawnPowerup();
    powerupTimeout = setTimeout(spawnPowerupLoop, 6000 + Math.random() * 4000);
}

// Button events
startBtn.onclick = startGame;
pauseBtn.onclick = pauseGame;
resumeBtn.onclick = resumeGame;

// Responsive resize
window.addEventListener("resize", () => {
    // Optionally, reposition targets/powerups if needed
});

// Show leaderboard on load
displayLeaderboard();
updateScore();