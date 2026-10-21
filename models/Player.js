import { Entity } from './Entity.js'
import { Bullet } from './Bullet.js'
import { drawProgressBar } from './utils.js'
import { canvas, ctx, topLimit, bottomLimit, COLORS, RELOAD_TIME, HEAL_TIME } from './config.js'

export class Player extends Entity {
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
      if (enemy && Math.abs(this.x - enemy.x) < 80 && Math.abs(this.y - enemy.y) < 50) {
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
