import { rand } from "./utils.js";

export class Particle {
  constructor(x, y, color, glow = false) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(60, 300);

    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.r = rand(2, 6);
    this.life = rand(250, 800);
    this.maxLife = this.life;
    this.color = color;
    this.glow = glow;
  }

  update(deltaTime) {
    const seconds = deltaTime / 1000;

    this.x += this.vx * seconds;
    this.y += this.vy * seconds;

    this.vx *= 0.985;
    this.vy *= 0.985;

    this.life -= deltaTime;
  }

  draw(ctx, camera) {
    const alpha = Math.max(0, this.life / this.maxLife);

    ctx.save();

    ctx.globalAlpha = alpha;

    if (this.glow) {
      ctx.shadowBlur = 18;
      ctx.shadowColor = this.color;
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x - camera.x, this.y - camera.y, this.r * alpha, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  get dead() {
    return this.life <= 0;
  }
}