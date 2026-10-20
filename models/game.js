import {Enemy} from './Enemy'
import {Player} from './Player'
import {Bullet} from './Bullet'
import {Ammo} from './pickups/Ammo'
import {Heal} from './pickups/Heals' 

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

// Constantes globales
const topLimit = 200, bottomLimit = 400;
const RELOAD_TIME = 300, HEAL_TIME = 120;
const COLORS = { player: "cyan", enemy: "orange", ammo: "blue", heal: "green", bullet: "yellow" };

let gameOver = false, paused = false, kills = 0;
let player, currentEnemy, bullets = [], ammoPicks = [], healPicks = [];

/** ---------------------- CLASES ---------------------- **/




/** ---------------------- FUNCIONES AUXILIARES ---------------------- **/
function drawProgressBar(entity, progress) {
  const barW = 40;
  ctx.fillStyle = "#555"; ctx.fillRect(entity.x, entity.y + entity.h + 5, barW, 6);
  ctx.fillStyle = "yellow"; ctx.fillRect(entity.x, entity.y + entity.h + 5, barW * (1 - progress), 6);
}

function randomPosition() {
  let x; do { x = Math.random() * (canvas.width - 60) + 30; } while (Math.abs(x - player.x) < 150);
  let y = Math.random() * (bottomLimit - topLimit - 60) + topLimit;
  return { x, y };
}

function resetGame() {
  player = new Player();
  currentEnemy = new Enemy(...Object.values(randomPosition()));
  bullets = []; ammoPicks = []; healPicks = [];
  kills = 0; gameOver = false; paused = false;
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
  },
  "p": () => paused = !paused
};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
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
  const estado = paused ? "PAUSADO" : player.reloading ? "RECARGANDO" : player.canShoot ? "CARGADO" : player.ammo > 0 ? "VACÍO" : "";
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
      kills++; currentEnemy = new Enemy(...Object.values(randomPosition())); player.reloading = false;
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
