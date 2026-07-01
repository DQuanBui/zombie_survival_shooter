export class Bullet {
  constructor(x, y, angle, weapon, damageBoost) {
    this.x = x;
    this.y = y;
    this.r = weapon.pellets > 1 ? 4 : 5;
    this.vx = Math.cos(angle) * weapon.bulletSpeed;
    this.vy = Math.sin(angle) * weapon.bulletSpeed;
    this.damage = weapon.damage * damageBoost;
    this.life = weapon.pellets > 1 ? 430 : 760;
    this.color = weapon.color;
  }

  update(deltaTime) {
    const seconds = deltaTime / 1000;

    this.x += this.vx * seconds;
    this.y += this.vy * seconds;
    this.life -= deltaTime;
  }

  draw(ctx, camera) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    ctx.save();

    ctx.shadowBlur = 16;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;

    ctx.beginPath();
    ctx.arc(screenX, screenY, this.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(screenX - this.vx * 0.025, screenY - this.vy * 0.025);
    ctx.stroke();

    ctx.restore();
  }
}