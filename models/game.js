import { Enemy } from './Enemy.js'
import { Player } from './Player.js'
import { Ammo } from './pickups/Ammo.js'
import { Heal } from './pickups/Heals.js'
import { canvas, ctx, topLimit, bottomLimit } from './config.js'

const restartBtn = document.getElementById("restartBtn");

let gameOver = false, paused = false, kills = 0;
let player, currentEnemy, bullets = [], ammoPicks = [], healPicks = [];

/** ---------------------- CLASES ---------------------- **/




/** ---------------------- FUNCIONES AUXILIARES ---------------------- **/
function randomPosition() {
  let x; do { x = Math.random() * (canvas.width - 60) + 30; } while (Math.abs(x - player.x) < 150);
  let y = Math.random() * (bottomLimit - topLimit - 60) + topLimit;
  return { x, y };
}

function spawnEnemy() {
  const pos = randomPosition();
  return new Enemy(pos.x, pos.y);
}

function resetGame() {
  player = new Player();
  currentEnemy = spawnEnemy();
  bullets = []; ammoPicks = []; healPicks = [];
  kills = 0; gameOver = false; paused = false;
  Object.keys(keys).forEach(key => delete keys[key]);
  restartBtn.style.display = "none"; gameLoop();
}

/** ---------------------- CONTROLES ---------------------- **/
const keys = {};
const controls = {
  "a": () => { player.vx = -player.speed; player.direction = -1; },
  "d": () => { player.vx = player.speed; player.direction = 1; },
  "w": () => { if (!player.isJumping) player.vy = -player.speed; },
  "s": () => { if (!player.isJumping) player.vy = player.speed; },
  " ": () => player.jump(),
  "j": () => player.attack(currentEnemy),
  "k": () => player.shoot(bullets),
  "r": () => player.reload(),
  "h": () => player.heal(),
  "f": () => {
    [...ammoPicks, ...healPicks].forEach(pickup => {
      if (pickup.active && Math.abs(player.x - pickup.x) < 40 && Math.abs(player.y - pickup.y) < 40) {
        if (pickup instanceof Ammo) player.ammo += 2;
        if (pickup instanceof Heal) player.bandages++;
        pickup.active = false;
      }
    });
  }
};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.repeat) return;
  if (e.key.toLowerCase() === "p" && !gameOver) paused = !paused;
  if (e.key === "Enter" && gameOver) resetGame();
});
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);
restartBtn.addEventListener("click", resetGame);

/** ---------------------- BUCLE PRINCIPAL ---------------------- **/
function handleInput() {
  player.vx = 0; player.vy = 0;
  Object.entries(controls).forEach(([key, action]) => { if (keys[key]) action(); });
}

function drawHUD() {
  ctx.fillStyle = "black"; ctx.fillRect(0, 0, canvas.width, 30);
  ctx.fillStyle = "white"; ctx.font = "14px sans-serif";
  const estado = paused ? "PAUSADO" : player.reloading ? "RECARGANDO" : player.canShoot ? "CARGADO" : player.ammo > 0 ? "POR RECARGAR" : "SIN MUNICIÓN";
  ctx.fillText(`Vida: ${player.health} | Vendajes: ${player.bandages} | Balas: ${player.canShoot ? player.ammo + 1 : player.ammo} | Enemigos: ${kills} | Estado: ${estado}`, 20, 20);
}

function gameLoop() {
  if (gameOver) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawHUD();

  if (paused) {
    ctx.fillStyle = "white"; ctx.font = "50px sans-serif"; ctx.fillText("PAUSE", 330, 240);
    return requestAnimationFrame(gameLoop);
  }

  ctx.fillStyle = "#444"; ctx.fillRect(0, topLimit + 60, canvas.width, bottomLimit - topLimit + 60);
  handleInput();

  ammoPicks.forEach(p => p.draw());
  healPicks.forEach(p => p.draw());
  player.update(); player.draw();

  if (currentEnemy) {
    currentEnemy.update(player); currentEnemy.draw();
    if (currentEnemy.health <= 0) {
      if (kills % 5 === 0) ammoPicks.push(new Ammo(currentEnemy.x, currentEnemy.y));
      if (kills % 7 === 0) healPicks.push(new Heal(currentEnemy.x, currentEnemy.y));
      kills++; currentEnemy = spawnEnemy(); player.reloading = false;
    }
  }

  bullets.forEach(b => { b.update(currentEnemy); b.draw(); });
  bullets = bullets.filter(b => b.active);

  if (player.health <= 0) {
    gameOver = true;
    ctx.fillStyle = "white"; ctx.font = "40px sans-serif"; ctx.fillText("¡Has perdido!", 300, 200);
    restartBtn.style.display = "inline-block"; return;
  }
  ammoPicks = ammoPicks.filter(p => p.active);
  healPicks = healPicks.filter(p => p.active);

  requestAnimationFrame(gameLoop);
}

// Iniciar el juego cuando la página carga
window.addEventListener('DOMContentLoaded', resetGame);
