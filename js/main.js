import { GAME } from "./config.js";
import { setupInput, keys, mouse } from "./input.js";
import { Player } from "./player.js";
import { Zombie } from "./zombie.js";
import { WeaponManager } from "./weapon.js";
import { Particle } from "./particle.js";
import { UI } from "./ui.js";
import { rand, circleCollision } from "./utils.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

let width = window.innerWidth;
let height = window.innerHeight;
let dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  mouse.x = width / 2;
  mouse.y = height / 2;
}

window.addEventListener("resize", resize);
resize();
setupInput(canvas);

const ui = new UI();

const game = {
  state: "menu",
  time: 0,
  lastTime: performance.now(),

  worldWidth: GAME.worldWidth,
  worldHeight: GAME.worldHeight,

  camera: {
    x: 0,
    y: 0
  },

  score: 0,
  kills: 0,
  wave: 1,

  xp: 0,
  xpNeed: 100,
  level: 1,

  enemiesToSpawn: 0,
  spawnTimer: 0,
  spawnDelay: 900,

  shake: 0,
  flash: 0
};

let player;
let weaponManager;
let bullets = [];
let zombies = [];
let particles = [];

function resetGame() {
  game.state = "playing";
  game.time = 0;

  game.score = 0;
  game.kills = 0;
  game.wave = 1;

  game.xp = 0;
  game.xpNeed = 100;
  game.level = 1;

  game.enemiesToSpawn = 0;
  game.spawnTimer = 0;
  game.spawnDelay = 900;

  game.shake = 0;
  game.flash = 0;

  player = new Player(game.worldWidth / 2, game.worldHeight / 2);
  weaponManager = new WeaponManager();

  bullets = [];
  zombies = [];
  particles = [];

  ui.hideAllScreens();
  ui.showToast("Mission started");

  startWave();
}

function startWave() {
  game.enemiesToSpawn = 7 + game.wave * 4;
  game.spawnDelay = Math.max(260, 950 - game.wave * 35);

  if (game.wave === 2) {
    weaponManager.unlock("smg");
    ui.showToast("New weapon unlocked: SMG");
  }

  if (game.wave === 4) {
    weaponManager.unlock("shotgun");
    ui.showToast("New weapon unlocked: SHOTGUN");
  }

  for (let i = 0; i < Math.min(5, game.enemiesToSpawn); i++) {
    spawnZombie();
    game.enemiesToSpawn--;
  }
}

function spawnZombie() {
  const side = Math.floor(Math.random() * 4);
  let x;
  let y;

  if (side === 0) {
    x = rand(0, game.worldWidth);
    y = -60;
  } else if (side === 1) {
    x = game.worldWidth + 60;
    y = rand(0, game.worldHeight);
  } else if (side === 2) {
    x = rand(0, game.worldWidth);
    y = game.worldHeight + 60;
  } else {
    x = -60;
    y = rand(0, game.worldHeight);
  }

  let type = "walker";
  const roll = Math.random();

  if (game.wave >= 3 && roll > 0.72) type = "runner";
  if (game.wave >= 5 && roll > 0.86) type = "brute";
  if (game.wave % 5 === 0 && game.enemiesToSpawn <= 1) type = "boss";

  zombies.push(new Zombie(x, y, type, game.wave));
}

function update(deltaTime) {
  if (game.state !== "playing") return;

  game.time += deltaTime;
  game.shake = Math.max(0, game.shake - deltaTime * 0.03);
  game.flash = Math.max(0, game.flash - deltaTime * 0.002);

  handleKeyboardShortcuts();

  player.update(deltaTime, game);
  weaponManager.update(deltaTime);

  updateCamera();
  updateShooting();
  updateBullets(deltaTime);
  updateZombies(deltaTime);
  updateParticles(deltaTime);
  updateSpawner(deltaTime);

  ui.update(game, player, weaponManager);

  if (player.health <= 0) {
    game.state = "gameover";
    saveHighScore();
    ui.showGameOver(game);
  }
}

function handleKeyboardShortcuts() {
  if (keys["1"]) weaponManager.switch("pistol");
  if (keys["2"]) {
    if (!weaponManager.switch("smg")) ui.showToast("SMG locked");
  }
  if (keys["3"]) {
    if (!weaponManager.switch("shotgun")) ui.showToast("Shotgun locked");
  }

  if (keys.r) {
    weaponManager.reload();
  }
}

function updateCamera() {
  game.camera.x = player.x - width / 2;
  game.camera.y = player.y - height / 2;

  game.camera.x = Math.max(0, Math.min(game.camera.x, game.worldWidth - width));
  game.camera.y = Math.max(0, Math.min(game.camera.y, game.worldHeight - height));
}

function updateShooting() {
  if (!mouse.down) return;

  const newBullets = weaponManager.shoot(
    player,
    mouse,
    game.camera,
    width,
    height,
    game
  );

  bullets.push(...newBullets);

  if (newBullets.length > 0) {
    for (let i = 0; i < 8; i++) {
      particles.push(new Particle(player.x, player.y, "#ffcc4d", true));
    }
  }
}

function updateBullets(deltaTime) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    bullet.update(deltaTime);

    if (
      bullet.life <= 0 ||
      bullet.x < 0 ||
      bullet.y < 0 ||
      bullet.x > game.worldWidth ||
      bullet.y > game.worldHeight
    ) {
      bullets.splice(i, 1);
      continue;
    }

    for (let j = zombies.length - 1; j >= 0; j--) {
      const zombie = zombies[j];

      if (circleCollision(bullet, zombie)) {
        zombie.takeDamage(bullet.damage);

        for (let p = 0; p < 10; p++) {
          particles.push(new Particle(zombie.x, zombie.y, "#ff1f3d", false));
        }

        bullets.splice(i, 1);

        if (zombie.dead) {
          killZombie(j);
        }

        break;
      }
    }
  }
}

function killZombie(index) {
  const zombie = zombies[index];

  zombies.splice(index, 1);

  game.score += zombie.score;
  game.kills++;
  game.xp += zombie.xp;

  for (let i = 0; i < 22; i++) {
    particles.push(new Particle(zombie.x, zombie.y, zombie.color, true));
  }

  if (game.xp >= game.xpNeed) {
    game.xp -= game.xpNeed;
    game.level++;
    game.xpNeed = Math.floor(game.xpNeed * 1.25);

    player.damageBoost *= 1.08;
    player.maxHealth += 8;
    player.health = player.maxHealth;

    ui.showToast("Level up: damage and health increased");
  }
}

function updateZombies(deltaTime) {
  for (const zombie of zombies) {
    zombie.update(deltaTime, player, game);
  }
}

function updateParticles(deltaTime) {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update(deltaTime);

    if (particles[i].dead) {
      particles.splice(i, 1);
    }
  }
}

function updateSpawner(deltaTime) {
  game.spawnTimer += deltaTime;

  if (game.enemiesToSpawn > 0 && game.spawnTimer > game.spawnDelay) {
    spawnZombie();
    game.enemiesToSpawn--;
    game.spawnTimer = 0;
  }

  if (game.enemiesToSpawn <= 0 && zombies.length === 0) {
    game.wave++;
    game.score += 250 + game.wave * 80;

    ui.showToast(`Wave ${game.wave}`);
    startWave();
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  const shakeX = game.shake > 0 ? rand(-game.shake, game.shake) : 0;
  const shakeY = game.shake > 0 ? rand(-game.shake, game.shake) : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawWorld();

  for (const bullet of bullets) {
    bullet.draw(ctx, game.camera);
  }

  for (const zombie of zombies) {
    zombie.draw(ctx, game.camera, player);
  }

  player?.draw(ctx, game.camera, mouse, width, height, weaponManager.current);

  for (const particle of particles) {
    particle.draw(ctx, game.camera);
  }

  ctx.restore();

  drawLighting();
  drawCrosshair();
}

function drawWorld() {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#101522");
  gradient.addColorStop(0.5, "#111827");
  gradient.addColorStop(1, "#071016");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.045)";
  ctx.lineWidth = 1;

  const grid = 80;

  const startX = -game.camera.x % grid;
  const startY = -game.camera.y % grid;

  for (let x = startX; x < width; x += grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = startY; y < height; y += grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawLighting() {
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    80,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.65
  );

  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.48, "rgba(0,0,0,0.15)");
  gradient.addColorStop(1, "rgba(0,0,0,0.78)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawCrosshair() {
  const size = 13;

  ctx.save();

  ctx.strokeStyle = "rgba(255,255,255,0.86)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "#ffffff";

  ctx.beginPath();
  ctx.moveTo(mouse.x - size, mouse.y);
  ctx.lineTo(mouse.x - 4, mouse.y);
  ctx.moveTo(mouse.x + 4, mouse.y);
  ctx.lineTo(mouse.x + size, mouse.y);
  ctx.moveTo(mouse.x, mouse.y - size);
  ctx.lineTo(mouse.x, mouse.y - 4);
  ctx.moveTo(mouse.x, mouse.y + 4);
  ctx.lineTo(mouse.x, mouse.y + size);
  ctx.stroke();

  ctx.restore();
}

function saveHighScore() {
  const currentBest = Number(localStorage.getItem("deadZoneHighScore") || 0);

  if (game.score > currentBest) {
    localStorage.setItem("deadZoneHighScore", game.score);
  }
}

function loop(now) {
  const deltaTime = Math.min(GAME.maxDeltaTime, now - game.lastTime);
  game.lastTime = now;

  update(deltaTime);
  draw();

  requestAnimationFrame(loop);
}

startBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (key === "p" && game.state === "playing") {
    game.state = "paused";
    ui.showPause();
  } else if (key === "p" && game.state === "paused") {
    game.state = "playing";
    ui.hidePause();
  }
});

requestAnimationFrame(loop);