import { angleTo, clamp, circleCollision } from "./utils.js";
import { ZOMBIE_TYPES } from "./config.js";

export class Zombie {
  constructor(x, y, type, wave) {
    const stats = ZOMBIE_TYPES[type];

    this.x = x;
    this.y = y;
    this.type = type;

    this.r = stats.radius;
    this.maxHealth = stats.health + wave * 8;
    this.health = this.maxHealth;

    this.speed = stats.speed + wave * 3;
    this.damage = stats.damage;
    this.color = stats.color;
    this.score = stats.score;
    this.xp = stats.xp;

    this.attackCooldown = 0;
    this.stun = 0;
    this.wobble = Math.random() * 1000;
  }

  update(deltaTime, player, game) {
    const seconds = deltaTime / 1000;

    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    this.stun = Math.max(0, this.stun - deltaTime);
    this.wobble += deltaTime * 0.006;

    const angle = angleTo(this, player);
    const wobbleAmount = Math.sin(this.wobble) * 0.22;
    const speed = this.stun > 0 ? this.speed * 0.35 : this.speed;

    this.x += Math.cos(angle + wobbleAmount) * speed * seconds;
    this.y += Math.sin(angle + wobbleAmount) * speed * seconds;

    this.x = clamp(this.x, this.r, game.worldWidth - this.r);
    this.y = clamp(this.y, this.r, game.worldHeight - this.r);

    if (circleCollision(this, player) && this.attackCooldown <= 0) {
      player.takeDamage(this.damage, game);
      this.attackCooldown = this.type === "runner" ? 600 : 900;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    this.stun = 80;
  }

  get dead() {
    return this.health <= 0;
  }

  draw(ctx, camera, player) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    const angle = angleTo(this, player);

    ctx.save();

    ctx.shadowBlur = 26;
    ctx.shadowColor = this.color;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.arc(
      screenX - Math.cos(angle) * 3,
      screenY - Math.sin(angle) * 3,
      this.r * 0.68,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#ff2222";
    ctx.beginPath();
    ctx.arc(
      screenX + Math.cos(angle - 0.35) * this.r * 0.45,
      screenY + Math.sin(angle - 0.35) * this.r * 0.45,
      Math.max(2.5, this.r * 0.12),
      0,
      Math.PI * 2
    );
    ctx.arc(
      screenX + Math.cos(angle + 0.35) * this.r * 0.45,
      screenY + Math.sin(angle + 0.35) * this.r * 0.45,
      Math.max(2.5, this.r * 0.12),
      0,
      Math.PI * 2
    );
    ctx.fill();

    const hpWidth = this.r * 2;
    const hpHeight = 5;
    const hpPercent = Math.max(0, this.health / this.maxHealth);

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(screenX - hpWidth / 2, screenY - this.r - 14, hpWidth, hpHeight);

    ctx.fillStyle = hpPercent > 0.45 ? "#7cff6b" : "#ff4d4d";
    ctx.fillRect(
      screenX - hpWidth / 2,
      screenY - this.r - 14,
      hpWidth * hpPercent,
      hpHeight
    );

    ctx.restore();
  }
}