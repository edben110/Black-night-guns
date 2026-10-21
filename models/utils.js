import { ctx } from './config.js';

export function drawProgressBar(entity, progress) {
  const barW = 40;
  ctx.fillStyle = "#555"; ctx.fillRect(entity.x, entity.y + entity.h + 5, barW, 6);
  ctx.fillStyle = "yellow"; ctx.fillRect(entity.x, entity.y + entity.h + 5, barW * (1 - progress), 6);
}
