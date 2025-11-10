const rankingList = document.getElementById("ranking-list") as HTMLElement;

// ------------------------------------------------------------
// 🎴 Juego de Memoria - Versión TypeScript
// ------------------------------------------------------------

// Elementos del DOM
const boardEl = document.getElementById("board") as HTMLElement;
const restartBtn = document.getElementById("restart") as HTMLButtonElement;
const triesEl = document.getElementById("tries") as HTMLElement;
const timeEl = document.getElementById("time") as HTMLElement;
const levelSelect = document.getElementById("level") as HTMLSelectElement;


// Pantalla de inicio
const startScreen = document.getElementById("start-screen") as HTMLElement;
const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
const gameSection = document.getElementById("game") as HTMLElement;

// Sonido
const bgMusic = document.getElementById("bg-music") as HTMLAudioElement;
const flipSound = document.getElementById("flip-sound") as HTMLAudioElement;
const winSound = document.getElementById("win-sound") as HTMLAudioElement;
const soundBtn = document.getElementById("sound-btn") as HTMLButtonElement;
let soundEnabled = true;

// Mostrar el juego y reproducir música
startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameSection.classList.remove("hidden");
  if (soundEnabled) bgMusic.play();
});

// Botón de sonido
soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
  if (soundEnabled) {
    bgMusic.play();
  } else {
    bgMusic.pause();
  }
});

// Ejemplo: reproducir efectos dentro del juego
function playFlipSound() {
  if (soundEnabled) flipSound.play();
}

function playWinSound() {
  if (soundEnabled) winSound.play();
}


// Mostrar juego y ocultar menú al hacer clic
startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameSection.classList.remove("hidden");
});


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

// Configuración de niveles
const LEVELS = {
  easy: { cards: 8, timeLimit: 120, basePoints: 100 },
  medium: { cards: 12, timeLimit: 90, basePoints: 200 },
  hard: { cards: 16, timeLimit: 60, basePoints: 300 },
};

// Variables de estado
let levelKey: keyof typeof LEVELS = (levelSelect?.value as keyof typeof LEVELS) || "medium";
let level = LEVELS[levelKey];
let cards: Card[] = [];
let first: SelectedCard | null = null;
let second: SelectedCard | null = null;
let lock = false;
let tries = 0;
let matchedCount = 0;
let timer: number | null = null;
let startTime: number | null = null;
let remainingTime: number = level.timeLimit;
let score: number = 0;

// Lista de íconos
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
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    remainingTime = level.timeLimit - elapsed;
    if (remainingTime <= 0) {
      stopTimer();
      alert("⏰ ¡Se acabó el tiempo! Inténtalo de nuevo.");
      resetGame();
    } else {
      timeEl.textContent = formatTime(remainingTime * 1000);
    }
  }, 1000);
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
  timeEl.textContent = formatTime(level.timeLimit * 1000);
  first = null;
  second = null;
  lock = false;
  matchedCount = 0;
  boardEl.innerHTML = "";

  // Obtener nivel actual
  levelKey = levelSelect.value as keyof typeof LEVELS;
  level = LEVELS[levelKey];
  remainingTime = level.timeLimit;
  score = 0;

  initBoard(level.cards);
  startTimer();
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
        const bonus = Math.max(0, remainingTime * 2);
        score = level.basePoints + bonus - tries * 5;

        alert(
          `🎉 ¡Ganaste!\n` +
          `Nivel: ${levelKey.toUpperCase()}\n` +
          `Intentos: ${tries}\n` +
          `Tiempo restante: ${remainingTime}s\n` +
          `Puntuación: ${score}`
        );

        saveScore(score, tries, remainingTime, levelKey);
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
// 🏆 Sistema de Ranking (LocalStorage)
// ------------------------------------------------------------
interface ScoreEntry {
  name: string;
  level: string;
  points: number;
  tries: number;
  time: number;
  date: string;
}

function saveScore(points: number, tries: number, remainingTime: number, levelKey: string): void {
  const name = prompt("🎮 Ingresa tu nombre para el ranking:") || "Jugador";
  const entry: ScoreEntry = {
    name,
    level: levelKey,
    points,
    tries,
    time: remainingTime,
    date: new Date().toLocaleDateString(),
  };

  const stored = localStorage.getItem("cardMemoryRanking");
  const ranking: ScoreEntry[] = stored ? JSON.parse(stored) : [];
  ranking.push(entry);

  // Ordenar de mayor a menor puntaje
  ranking.sort((a, b) => b.points - a.points);

  // Mantener solo los 5 mejores
  const topRanking = ranking.slice(0, 5);
  localStorage.setItem("cardMemoryRanking", JSON.stringify(topRanking));

  renderRanking();
}

function renderRanking(): void {
  const stored = localStorage.getItem("cardMemoryRanking");
  const ranking: ScoreEntry[] = stored ? JSON.parse(stored) : [];

  rankingList.innerHTML = ranking
    .map(
      (r, i) =>
        `<li><strong>${i + 1}.</strong> 🏅 ${r.name} — <span class="score">${r.points} pts</span> (${r.level}, ${r.tries} intentos, ${r.time}s restantes)</li>`
    )
    .join("");
}

// ------------------------------------------------------------
// 🔁 Eventos de UI
// ------------------------------------------------------------
restartBtn.addEventListener("click", resetGame);
levelSelect.addEventListener("change", resetGame);

// ------------------------------------------------------------
// 🏁 Inicialización
// ------------------------------------------------------------
renderRanking();
resetGame();