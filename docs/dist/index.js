"use strict";
const rankingList = document.getElementById("ranking-list");
// ------------------------------------------------------------
// 🎴 Juego de Memoria - Versión TypeScript
// ------------------------------------------------------------
// Elementos del DOM
const boardEl = document.getElementById("board");
const restartBtn = document.getElementById("restart");
const triesEl = document.getElementById("tries");
const timeEl = document.getElementById("time");
const levelSelect = document.getElementById("level");
const soundBtn = document.getElementById("sound-btn");
const volumeSlider = document.getElementById("volume-slider");
// Pantalla de inicio
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const gameSection = document.getElementById("game");
// ------------------------------
// 🎵 SONIDOS (rutas corregidas)
// ------------------------------
const flipSound = new Audio("./sounds/flip.mp3");
const matchSound = new Audio("./sounds/match.mp3");
const winSound = new Audio("./sounds/win.mp3");
const bgMusic = new Audio("./sounds/bg.mp3");
bgMusic.loop = true;
let soundEnabled = true;
// Evitar solapamientos
flipSound.preload = "auto";
matchSound.preload = "auto";
winSound.preload = "auto";
bgMusic.preload = "auto";
// ------------------------------
// Funciones de sonido
// ------------------------------
function playSound(sound) {
    if (!soundEnabled)
        return;
    sound.currentTime = 0;
    sound.play().catch(() => { });
}
function playFlip() {
    playSound(flipSound);
}
function playMatch() {
    playSound(matchSound);
}
function playWin() {
    playSound(winSound);
}
// ------------------------------
// Iniciar el juego desde la pantalla inicial
// ------------------------------
startBtn.addEventListener("click", () => {
    startScreen.classList.add("hidden");
    gameSection.classList.remove("hidden");
    // 🔊 Solo reproducir música después de interacción del usuario
    if (soundEnabled)
        bgMusic.play().catch(() => { });
});
// ------------------------------
// SONIDO ON/OFF
// ------------------------------
soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled)
        bgMusic.play().catch(() => { });
    else
        bgMusic.pause();
});
// ------------------------------
// SLIDER DE VOLUMEN
// ------------------------------
volumeSlider.addEventListener("input", () => {
    const v = Number(volumeSlider.value);
    flipSound.volume = v;
    matchSound.volume = v;
    winSound.volume = v;
    bgMusic.volume = v;
});
// Configuración de niveles
const LEVELS = {
    easy: { cards: 8, timeLimit: 120, basePoints: 100 },
    medium: { cards: 12, timeLimit: 90, basePoints: 200 },
    hard: { cards: 16, timeLimit: 60, basePoints: 300 },
};
// Variables de estado
let levelKey = (levelSelect === null || levelSelect === void 0 ? void 0 : levelSelect.value) || "medium";
let level = LEVELS[levelKey];
let cards = [];
let first = null;
let second = null;
let lock = false;
let tries = 0;
let matchedCount = 0;
let timer = null;
let startTime = null;
let remainingTime = level.timeLimit;
let score = 0;
// Iconos
const ICONS = [
    "♠", "♥", "♦", "♣", "★", "♪", "☼", "✿",
    "☺", "⚡", "☯", "✈︎", "⚽", "🍀", "🐱", "🐶"
];
// ------------------------------------------------------------
// 🕒 Funciones auxiliares
// ------------------------------------------------------------
function formatTime(ms) {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
}
function startTimer() {
    if (timer)
        clearInterval(timer);
    startTime = Date.now();
    timer = window.setInterval(() => {
        if (!startTime)
            return;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        remainingTime = level.timeLimit - elapsed;
        if (remainingTime <= 0) {
            stopTimer();
            alert("⏰ ¡Se acabó el tiempo! Inténtalo de nuevo.");
            resetGame();
        }
        else {
            timeEl.textContent = formatTime(remainingTime * 1000);
        }
    }, 1000);
}
function stopTimer() {
    if (timer)
        clearInterval(timer);
    timer = null;
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
// ------------------------------------------------------------
// 🧠 Lógica principal del juego
// ------------------------------------------------------------
function resetGame() {
    stopTimer();
    tries = 0;
    triesEl.textContent = tries.toString();
    timeEl.textContent = formatTime(level.timeLimit * 1000);
    first = null;
    second = null;
    lock = false;
    matchedCount = 0;
    boardEl.innerHTML = "";
    levelKey = levelSelect.value;
    level = LEVELS[levelKey];
    remainingTime = level.timeLimit;
    score = 0;
    initBoard(level.cards);
    startTimer();
}
function initBoard(numCards) {
    const pairs = numCards / 2;
    const chosen = ICONS.slice(0, pairs);
    const deck = [...chosen, ...chosen];
    shuffle(deck);
    cards = deck.map((val, idx) => ({ id: idx, value: val, matched: false }));
    boardEl.className = "board";
    const cols = numCards <= 8 ? 3 : numCards <= 12 ? 4 : 5;
    boardEl.classList.add(`board--cols-${cols}`);
    cards.forEach((card) => {
        const cardEl = document.createElement("div");
        cardEl.className = "card";
        cardEl.dataset.id = card.id.toString();
        cardEl.innerHTML = `
      <div class="card__inner">
        <div class="card__face back">?</div>
        <div class="card__face front">${card.value}</div>
      </div>`;
        cardEl.addEventListener("click", () => onCardClick(card, cardEl));
        boardEl.appendChild(cardEl);
    });
}
function onCardClick(card, el) {
    if (lock || card.matched)
        return;
    if (!startTime)
        startTimer();
    if (el.classList.contains("is-flipped"))
        return;
    el.classList.add("is-flipped");
    playFlip();
    if (!first) {
        first = { card, el };
        return;
    }
    if (first.card.id === card.id)
        return;
    second = { card, el };
    lock = true;
    tries++;
    triesEl.textContent = tries.toString();
    if (first.card.value === second.card.value) {
        playMatch();
        first.card.matched = true;
        second.card.matched = true;
        first.el.classList.add("matched");
        second.el.classList.add("matched");
        matchedCount += 2;
        first = null;
        second = null;
        lock = false;
        if (matchedCount === cards.length) {
            stopTimer();
            playWin();
            setTimeout(() => {
                const bonus = Math.max(0, remainingTime * 2);
                score = level.basePoints + bonus - tries * 5;
                alert(`🎉 ¡Ganaste!\n` +
                    `Nivel: ${levelKey.toUpperCase()}\n` +
                    `Intentos: ${tries}\n` +
                    `Tiempo restante: ${remainingTime}s\n` +
                    `Puntuación: ${score}`);
                saveScore(score, tries, remainingTime, levelKey);
            }, 400);
        }
    }
    else {
        setTimeout(() => {
            first === null || first === void 0 ? void 0 : first.el.classList.remove("is-flipped");
            second === null || second === void 0 ? void 0 : second.el.classList.remove("is-flipped");
            first = null;
            second = null;
            lock = false;
        }, 900);
    }
}
function saveScore(points, tries, remainingTime, levelKey) {
    const name = prompt("🎮 Ingresa tu nombre para el ranking:") || "Jugador";
    const entry = {
        name,
        level: levelKey,
        points,
        tries,
        time: remainingTime,
        date: new Date().toLocaleDateString(),
    };
    const stored = localStorage.getItem("cardMemoryRanking");
    const ranking = stored ? JSON.parse(stored) : [];
    ranking.push(entry);
    ranking.sort((a, b) => b.points - a.points);
    const topRanking = ranking.slice(0, 5);
    localStorage.setItem("cardMemoryRanking", JSON.stringify(topRanking));
    renderRanking();
}
function renderRanking() {
    const stored = localStorage.getItem("cardMemoryRanking");
    const ranking = stored ? JSON.parse(stored) : [];
    rankingList.innerHTML = ranking
        .map((r, i) => `<li><strong>${i + 1}.</strong> 🏅 ${r.name} — <span class="score">${r.points} pts</span> (${r.level}, ${r.tries} intentos, ${r.time}s restantes)</li>`)
        .join("");
}
// ------------------------------------------------------------
// 🔁 Eventos
// ------------------------------------------------------------
restartBtn.addEventListener("click", resetGame);
levelSelect.addEventListener("change", resetGame);
// ------------------------------------------------------------
// 🏁 Inicialización
// ------------------------------------------------------------
renderRanking();
resetGame();
