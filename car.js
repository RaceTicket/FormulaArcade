// ====== CANVAS + MENU ======
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const startBtn = document.getElementById("startBtn");
const highscoreText = document.getElementById("highscoreText");

const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreText = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

const loadingScreen = document.getElementById("loadingScreen");

// ====== MUSIC (MENU MUSIC PLAYS FOREVER) ======
const menuMusic = new Audio("GameMusic.mp3");
menuMusic.loop = true;
menuMusic.volume = 0.5;

// Dummy gameMusic so code doesn't break
const gameMusic = new Audio();
gameMusic.loop = true;
gameMusic.volume = 0;

// ====== LOADING SOUND ======
const loadingSound = new Audio("carpassingsound.mp4");
loadingSound.volume = 1.0;

let isMuted = false;

// Start menu music on load
window.addEventListener("load", () => {
  menuMusic.play().catch(() => {
    document.addEventListener("click", () => menuMusic.play(), { once: true });
  });
});

// ====== MUTE BUTTON ======
const muteBtn = document.createElement("button");
muteBtn.textContent = "Mute";
muteBtn.style.position = "absolute";
muteBtn.style.top = "20px";
muteBtn.style.right = "20px";
muteBtn.style.padding = "10px 20px";
muteBtn.style.fontSize = "18px";
muteBtn.style.cursor = "pointer";
document.body.appendChild(muteBtn);

muteBtn.addEventListener("click", () => {
  isMuted = !isMuted;

  menuMusic.muted = isMuted;
  loadingSound.muted = isMuted;

  const video = loadingScreen.querySelector("video");
  if (video) video.muted = isMuted;

  muteBtn.textContent = isMuted ? "Unmute" : "Mute";
});

// ====== HIGHSCORE ======
let highscore = localStorage.getItem("highscore");
if (!highscore) highscore = 0;
highscoreText.textContent = "Highscore: " + highscore;

// ====== RESTART BUTTON ======
restartBtn.addEventListener("click", restartGame);

function restartGame() {
  gameOverScreen.style.display = "none";
  menu.style.display = "block";

  score = 0;
  enemies.length = 0;
  player.x = 175;
  player.y = 480;
}

// ====== CAR IMAGE MAP ======
const carImages = {
  RedBull: "redbull.png",
  McLaren: "mcllaren.png",
  Mercedes: "mercedes.png",
  Ferrari: "ferrari.png",
  Williams: "williams.png",
  RacingBulls: "racingbulls.png",
  AstonMartin: "astonmartin.png",
  Haas: "haas.png",
  KickSauber: "kicks.png",
  Alpine: "alpine.png"
};

// ====== PLAYER CAR ======
let playerImg = new Image();
let enemyImg = new Image();

const player = {
  x: 175,
  y: 480,
  width: 50,
  height: 100,
  speed: 5
};

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

// ====== ENEMY CARS ======
const enemies = [];

function spawnEnemy() {
  const enemy = {
    x: Math.random() * (canvas.width - 50),
    y: -120,
    width: 50,
    height: 100,
    speed: 4
  };
  enemies.push(enemy);
}

setInterval(spawnEnemy, 1000);

function updateEnemies() {
  enemies.forEach(enemy => {
    enemy.y += enemy.speed;
  });
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
  });
}

// ====== CONTROLS ======
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

function movePlayer() {
  // LEFT movement: ArrowLeft or A
  if ((keys["ArrowLeft"] || keys["a"] || keys["A"]) && player.x > 0) {
    player.x -= player.speed;
  }

  // RIGHT movement: ArrowRight or D
  if ((keys["ArrowRight"] || keys["d"] || keys["D"]) && player.x < canvas.width - player.width) {
    player.x += player.speed;
  }
}


// ====== COLLISION DETECTION ======
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function detectCrashes() {
  for (let enemy of enemies) {
    if (checkCollision(player, enemy)) {

      if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", highscore);
        highscoreText.textContent = "Highscore: " + highscore;
      }

      gameRunning = false;

      finalScoreText.textContent = "Score: " + score;
      gameOverScreen.style.display = "block";
      canvas.style.display = "none";

      return;
    }
  }
}

// ====== SCORE SYSTEM ======
let score = 0;
let lastScoreTime = Date.now();

// ====== GAME STATE ======
let gameRunning = false;

// ====== START GAME WITH VIDEO + SOUND ======
startBtn.addEventListener("click", () => {
  menu.style.display = "none";
  loadingScreen.style.display = "block";

  const video = loadingScreen.querySelector("video");
  video.currentTime = 0;
  video.play();

  loadingSound.currentTime = 0;
  loadingSound.play();

  setTimeout(() => {
    loadingScreen.style.display = "none";
    startGame();
  }, 1000);
});

function startGame() {
  const yourCar = document.getElementsByTagName("select")[0].value;
  const opponentCar = document.getElementsByTagName("select")[1].value;

  playerImg.src = carImages[yourCar];
  enemyImg.src = carImages[opponentCar];

  canvas.style.display = "block";

  lastScoreTime = Date.now();
  score = 0;
  enemies.length = 0;

  gameRunning = true;
  gameLoop();
}

// ====== GAME LOOP ======
function gameLoop() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const now = Date.now();
  if (now - lastScoreTime >= 100) {
    score += 1;
    lastScoreTime = now;
  }

  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  movePlayer();
  updateEnemies();
  detectCrashes();

  drawPlayer();
  drawEnemies();

  requestAnimationFrame(gameLoop);
}

