import Input from "./input.js";
import Game from "./Game.js";

const canvas = document.getElementById("gameCanvas");
const overlay = document.getElementById("overlay");
const overlaySymbol = document.getElementById("overlaySymbol");
const overlayEyebrow = document.getElementById("overlayEyebrow");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const overlayStart = document.getElementById("overlayStart");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("statusText");

const input = new Input();

function updateInterface(data) {
  scoreEl.textContent = `${data.score} / 3`;
  bestEl.textContent = data.best;
  pauseBtn.disabled = data.state !== "running";
  startBtn.textContent = data.state === "running" ? "▶ Игра идёт" :
    data.state === "paused" ? "▶ Продолжить" : "▶ Старт";

  const labels = {
    ready: "ГОТОВ К СТАРТУ",
    running: "В ДОРОГЕ",
    paused: "ПАУЗА",
    won: "МИССИЯ ВЫПОЛНЕНА",
    lost: "МИССИЯ ПРОВАЛЕНА"
  };
  statusEl.textContent = data.notice || labels[data.state];

  if (data.state === "ready") {
    showOverlay("✦", "ТВОЁ ЗАДАНИЕ", "Доставь посылку!",
      "Собери 3 пропуска, избегай опасной зоны и доберись до главного корпуса.", "Начать игру");
  } else if (data.state === "paused") {
    showOverlay("Ⅱ", "ПЕРЕДЫШКА", "Игра на паузе",
      "Когда будешь готов, нажми «Продолжить» или клавишу старта.", "Продолжить");
  } else if (data.state === "won") {
    showOverlay("🏆", "ОТЛИЧНАЯ РАБОТА", "Посылка доставлена!",
      `Ты собрал все пропуска и завершил миссию. Счёт: ${data.score} из 3.`, "Играть ещё раз");
  } else if (data.state === "lost") {
    showOverlay("⚡", "МИССИЯ ЗАВЕРШЕНА", "Попробуем ещё раз?",
      `Ты собрал ${data.score} из 3 пропусков. Перезапусти уровень и попробуй снова.`, "Заново");
  } else {
    overlay.classList.add("hidden");
  }
}

function showOverlay(symbol, eyebrow, title, text, buttonText) {
  overlaySymbol.textContent = symbol;
  overlayEyebrow.textContent = eyebrow;
  overlayTitle.textContent = title;
  overlayText.textContent = text;
  overlayStart.innerHTML = `${buttonText} <span>→</span>`;
  overlay.classList.remove("hidden");
}

const game = new Game(canvas, input, updateInterface);
game.render();

function startOrContinue() {
  if (game.state === "paused") game.start();
  else if (game.state !== "running") game.start();
}
overlayStart.addEventListener("click", startOrContinue);
startBtn.addEventListener("click", startOrContinue);
pauseBtn.addEventListener("click", () => game.pause());
restartBtn.addEventListener("click", () => {
  game.reset();
  game.start();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden && game.state === "running") game.pause();
});

// Единственный игровой цикл. Он не создаётся повторно при старте и паузе.
function loop(timestamp) {
  if (game.state === "running") {
    if (game.lastTime === 0) game.lastTime = timestamp;
    const dt = Math.min((timestamp - game.lastTime) / 1000, 0.033);
    game.lastTime = timestamp;
    game.update(dt);
  } else {
    game.lastTime = 0;
  }
  game.render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
