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
class Entity {
  constructor(x, y, w, h, color) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.color = color;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Player extends Entity {
  constructor() {
    super(100, bottomLimit - 60, 40, 60, COLORS.player);
    this.vx = 0; this.vy = 0;
    this.speed = 3; this.health = this.maxhealth = 100;
    this.canShoot = true; this.healing = false; this.reloading = false;
    this.isJumping = false; this.grounded = true; this.attackCooldown = 0;
    this.ammo = 25; this.direction = 1;
    this.jumpHeight = 40; this.jumpDuration = 40; this.jumpProgress = 0;
    this.jumpOriginY = this.y; this.knockbackVX = 0; this.knockbackFrames = 0;
    this.bandages = 5; this.reloadTimer = 0; this.healTimer = 0;
  }

  update() {
    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x + this.vx));

    if (this.isJumping) {
      this.jumpProgress++;
      const t = this.jumpProgress / this.jumpDuration;
      this.y = this.jumpOriginY - (4 * this.jumpHeight * t * (1 - t));
      if (this.jumpProgress >= this.jumpDuration) {
        this.y = this.jumpOriginY;
        this.isJumping = false; this.grounded = true;
      }
    } else {
      this.y = Math.max(topLimit, Math.min(bottomLimit - this.h, this.y + this.vy));
    }

    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.reloading && --this.reloadTimer <= 0) { this.reloading = false; this.canShoot = true; }
    if (this.healing && --this.healTimer <= 0) {
      this.healing = false; this.health = Math.min(this.maxhealth, this.health + 25);
    }
    if (this.knockbackFrames > 0) { this.x += this.knockbackVX; this.knockbackVX *= 0.8; this.knockbackFrames--; }
  }

  draw() {
    super.draw();
    // Barra de vida
    ctx.fillStyle = "red"; ctx.fillRect(this.x, this.y - 10, this.w, 5);
    ctx.fillStyle = "lime"; ctx.fillRect(this.x, this.y - 10, this.w * (this.health / 100), 5);
    // Barra de acción
    if (this.reloading || this.healing) drawProgressBar(this, this.reloading ? this.reloadTimer / RELOAD_TIME : this.healTimer / HEAL_TIME);
  }

  attack(enemy) {
    if (this.attackCooldown === 0) {
      if (Math.abs(this.x - enemy.x) < 80 && Math.abs(this.y - enemy.y) < 50) {
        enemy.health -= 25;
        enemy.knockbackVX = this.direction === 1 ? 10 : -10;
        enemy.knockbackFrames = 10;
      }
      this.attackCooldown = 30;
      if (this.reloading) { this.reloading = false; this.reloadTimer = 0; this.ammo++; }
      if (this.healing) { this.healing = false; this.healTimer = 0; this.bandages++; }
    }
  }

  heal() {
    if (this.bandages > 0 && !this.healing && this.health < 100 && !this.reloading) {
      this.healing = true; this.healTimer = HEAL_TIME; this.bandages--;
    }
  }

  shoot(bullets) {
    if (this.canShoot && !this.reloading) {
      const offset = this.direction === 1 ? this.w : -5;
      bullets.push(new Bullet(this.x + offset, this.y + this.h / 2, this.direction));
      this.canShoot = false;
    }
  }

  reload() {
    if (!this.canShoot && !this.reloading && this.ammo > 0 && !this.healing) {
      this.reloading = true; this.reloadTimer = RELOAD_TIME; this.ammo--;
    }
  }

  jump() {
    if (this.grounded) { this.jumpOriginY = this.y; this.jumpProgress = 0; this.isJumping = true; this.grounded = false; }
  }
}

class Pickup extends Entity {
  constructor(x, y, color, w = 10, h = 20) {
    super(x, y, w, h, color);
    this.active = true;
  }
}
class Ammo extends Pickup { constructor(x, y) { super(x, y, COLORS.ammo); } }
class Heal extends Pickup { constructor(x, y) { super(x, y, COLORS.heal); } }

class Enemy extends Entity {
  constructor(x, y) {
    super(x, y, 40, 60, COLORS.enemy);
    this.speed = 1.2; this.health = 100; this.attackCooldown = 0; this.damage = 10;
    this.knockbackVX = 0; this.knockbackFrames = 0;
  }
  update(player) {
    let targetY = player.isJumping ? player.jumpOriginY : player.y;
    this.y += this.y < targetY ? this.speed : -this.speed;
    this.x += this.x < player.x ? this.speed : -this.speed;
    if (Math.abs(this.x - player.x) < 40 && Math.abs(this.y - player.y) < 40 && this.attackCooldown === 0) {
      if (!player.isJumping || player.attaking) {
        player.health -= this.damage;
        player.knockbackVX = player.direction !== -1 ? -10 : 10;
        player.knockbackFrames = 10;
        this.attackCooldown = 60;
      }
    }
    if (this.attackCooldown > 0) this.attackCooldown--;
    if (this.knockbackFrames > 0) { this.x += this.knockbackVX; this.knockbackVX *= 0.8; this.knockbackFrames--; }
  }
  draw() {
    super.draw();
    ctx.fillStyle = "red"; ctx.fillRect(this.x, this.y - 10, this.w, 5);
    ctx.fillStyle = "lime"; ctx.fillRect(this.x, this.y - 10, this.w * (this.health / 100), 5);
  }
}

class Bullet {
  constructor(x, y, direction) {
    this.x = x; this.y = y; this.radius = 5; this.speed = 8 * direction;
    this.color = COLORS.bullet; this.active = true;
  }
  update(enemy) {
    this.x += this.speed;
    if (Math.abs(this.x - enemy.x) < 30 && Math.abs(this.y - enemy.y) < 40) { enemy.health -= 50; this.active = false; }
    if (this.x < 0 || this.x > canvas.width) this.active = false;
  }
  draw() {
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color; ctx.fill();
  }
}

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
