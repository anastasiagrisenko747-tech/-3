import { resolvePlatformCollisions } from "./collision.js";

export default class Player {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.w = 30;
    this.h = 42;
    this.speed = 285;
    this.jumpPower = 610;
    this.gravity = 1550;
    this.reset();
  }

  reset() {
    this.x = this.startX;
    this.y = this.startY;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.animTime = 0;
  }

  update(dt, input, platforms) {
    const direction = input.horizontal;
    this.vx = direction * this.speed;
    if (direction !== 0) this.facing = direction;

    if (input.consumeJump() && this.onGround) {
      this.vy = -this.jumpPower;
      this.onGround = false;
    }

    const previous = { x: this.x, y: this.y, w: this.w, h: this.h };
    this.x += this.vx * dt;
    this.x = Math.max(0, Math.min(960 - this.w, this.x));

    this.vy += this.gravity * dt;
    this.y += this.vy * dt;
    this.onGround = false;
    resolvePlatformCollisions(this, platforms, previous);
    this.animTime += dt;
  }

  draw(ctx) {
    const moving = Math.abs(this.vx) > 0;
    const bob = this.onGround && moving ? Math.sin(this.animTime * 17) * 2 : 0;
    const x = this.x, y = this.y + bob;
    ctx.save();
    // Тень
    ctx.fillStyle = "rgba(5,12,25,.28)";
    ctx.beginPath(); ctx.ellipse(x + 15, y + 43, 15, 4, 0, 0, Math.PI * 2); ctx.fill();
    // Ноги
    ctx.fillStyle = "#23334d";
    const step = moving && this.onGround ? Math.sin(this.animTime * 17) * 3 : 0;
    ctx.fillRect(x + 6, y + 32, 7, 10 + step);
    ctx.fillRect(x + 18, y + 32, 7, 10 - step);
    // Корпус
    ctx.fillStyle = "#f0a44c";
    roundRect(ctx, x + 3, y + 15, 24, 21, 6); ctx.fill();
    // Рюкзак
    ctx.fillStyle = "#db7442";
    roundRect(ctx, x + (this.facing > 0 ? 0 : 21), y + 18, 9, 16, 3); ctx.fill();
    // Голова
    ctx.fillStyle = "#ffd3a2";
    ctx.beginPath(); ctx.arc(x + 15, y + 10, 10, 0, Math.PI * 2); ctx.fill();
    // Волосы и лицо
    ctx.fillStyle = "#29354c";
    ctx.beginPath(); ctx.arc(x + 15, y + 7, 10, Math.PI, Math.PI * 2); ctx.fill();
    ctx.fillRect(x + 5, y + 6, 5, 6);
    ctx.fillStyle = "#27344a";
    ctx.fillRect(x + (this.facing > 0 ? 19 : 9), y + 10, 2, 2);
    // Значок курьера
    ctx.fillStyle = "#fff2ce";
    ctx.fillRect(x + 11, y + 21, 8, 7);
    ctx.fillStyle = "#e28a3e";
    ctx.fillRect(x + 14, y + 22, 2, 5);
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
