import { canvas, ctx, COLORS } from './config.js'

export class Bullet {
  constructor(x, y, direction) {
    this.x = x; this.y = y; this.radius = 5; this.speed = 8 * direction;
    this.color = COLORS.bullet; this.active = true;
  }
  update(enemy) {
    this.x += this.speed;
    if (enemy && Math.abs(this.x - enemy.x) < 30 && Math.abs(this.y - enemy.y) < 40) { enemy.health -= 50; this.active = false; }
    if (this.x < 0 || this.x > canvas.width) this.active = false;
  }
  draw() {
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color; ctx.fill();
  }
}
