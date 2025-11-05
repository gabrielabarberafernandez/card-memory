// ------------------------------------------------------------
// 🎴 Juego de Memoria - Versión TypeScript
// ------------------------------------------------------------

// Elementos del DOM
const boardEl = document.getElementById("board") as HTMLElement;
const restartBtn = document.getElementById("restart") as HTMLButtonElement;
const triesEl = document.getElementById("tries") as HTMLElement;
const timeEl = document.getElementById("time") as HTMLElement;
const levelSelect = document.getElementById("level") as HTMLSelectElement;

// Tipos
interface Card {
  id: number;
  value: string;
  matched: boolean;
}

interface SelectedCard {
  card: Card;
  el: HTMLElement;
}

// Variables de estado
let level = parseInt(levelSelect?.value ?? "12", 10);
let cards: Card[] = [];
let first: SelectedCard | null = null;
let second: SelectedCard | null = null;
let lock = false;
let tries = 0;
let matchedCount = 0;
let timer: number | null = null;
let startTime: number | null = null;

// Lista de íconos (puedes cambiarlos por imágenes)
const ICONS: string[] = [
  "♠", "♥", "♦", "♣", "★", "♪", "☼", "✿",
  "☺", "⚡", "☯", "✈︎", "⚽", "🍀", "🐱", "🐶"
];

// ------------------------------------------------------------
// 🕒 Funciones auxiliares
// ------------------------------------------------------------
function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function startTimer(): void {
  if (timer) clearInterval(timer);
  startTime = Date.now();
  timer = window.setInterval(() => {
    if (startTime) timeEl.textContent = formatTime(Date.now() - startTime);
  }, 250);
}

function stopTimer(): void {
  if (timer) clearInterval(timer);
  timer = null;
}

function shuffle<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ------------------------------------------------------------
// 🧠 Lógica principal del juego
// ------------------------------------------------------------
function resetGame(): void {
  stopTimer();
  tries = 0;
  triesEl.textContent = tries.toString();
  timeEl.textContent = "0:00";
  first = null;
  second = null;
  lock = false;
  matchedCount = 0;
  boardEl.innerHTML = "";

  level = parseInt(levelSelect?.value ?? "12", 10);
  initBoard(level);
}

function initBoard(numCards: number): void {
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

function onCardClick(card: Card, el: HTMLElement): void {
  if (lock || card.matched) return;
  if (!startTime) startTimer();

  if (el.classList.contains("is-flipped")) return;
  el.classList.add("is-flipped");

  if (!first) {
    first = { card, el };
    return;
  }

  if (first.card.id === card.id) return; // Evitar doble clic en la misma carta

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
  } else {
    // ❌ No coinciden
    setTimeout(() => {
      first?.el.classList.remove("is-flipped");
      second?.el.classList.remove("is-flipped");
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