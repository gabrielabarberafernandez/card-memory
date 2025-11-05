"use strict";
// ------------------------------------------------------------
// 🎴 Juego de Memoria - Versión TypeScript
// ------------------------------------------------------------
var _a;
// Elementos del DOM
const boardEl = document.getElementById("board");
const restartBtn = document.getElementById("restart");
const triesEl = document.getElementById("tries");
const timeEl = document.getElementById("time");
const levelSelect = document.getElementById("level");
// Variables de estado
let level = parseInt((_a = levelSelect === null || levelSelect === void 0 ? void 0 : levelSelect.value) !== null && _a !== void 0 ? _a : "12", 10);
let cards = [];
let first = null;
let second = null;
let lock = false;
let tries = 0;
let matchedCount = 0;
let timer = null;
let startTime = null;
// Lista de íconos (puedes cambiarlos por imágenes)
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
        if (startTime)
            timeEl.textContent = formatTime(Date.now() - startTime);
    }, 250);
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
    var _a;
    stopTimer();
    tries = 0;
    triesEl.textContent = tries.toString();
    timeEl.textContent = "0:00";
    first = null;
    second = null;
    lock = false;
    matchedCount = 0;
    boardEl.innerHTML = "";
    level = parseInt((_a = levelSelect === null || levelSelect === void 0 ? void 0 : levelSelect.value) !== null && _a !== void 0 ? _a : "12", 10);
    initBoard(level);
}
function initBoard(numCards) {
    const pairs = numCards / 2;
    const chosen = ICONS.slice(0, pairs);
    const deck = [...chosen, ...chosen];
    shuffle(deck);
    cards = deck.map((val, idx) => ({ id: idx, value: val, matched: false }));
    // Ajustar columnas según nivel
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
    if (!first) {
        first = { card, el };
        return;
    }
    if (first.card.id === card.id)
        return; // Evitar doble clic en la misma carta
    second = { card, el };
    lock = true;
    tries++;
    triesEl.textContent = tries.toString();
    if (first.card.value === second.card.value) {
        // ✅ Coincidencia
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
            setTimeout(() => {
                alert(`🎉 ¡Ganaste! Intentos: ${tries}. Tiempo: ${timeEl.textContent}`);
            }, 400);
        }
    }
    else {
        // ❌ No coinciden
        setTimeout(() => {
            first === null || first === void 0 ? void 0 : first.el.classList.remove("is-flipped");
            second === null || second === void 0 ? void 0 : second.el.classList.remove("is-flipped");
            first = null;
            second = null;
            lock = false;
        }, 900);
    }
}
// ------------------------------------------------------------
// 🔁 Eventos de UI
// ------------------------------------------------------------
restartBtn.addEventListener("click", resetGame);
levelSelect.addEventListener("change", resetGame);
// ------------------------------------------------------------
// 🏁 Inicialización
// ------------------------------------------------------------
resetGame();
