import {Entity} from './Entity'
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
