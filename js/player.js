import { PLAYER_CONFIG } from "./config.js";
import { clamp } from "./utils.js";
import { keys } from "./input.js";

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = PLAYER_CONFIG.radius;

    this.speed = PLAYER_CONFIG.speed;
    this.maxHealth = PLAYER_CONFIG.maxHealth;
    this.health = this.maxHealth;

    this.maxStamina = PLAYER_CONFIG.maxStamina;
    this.stamina = this.maxStamina;

    this.invincible = 0;
    this.dashCooldown = 0;

    this.damageBoost = 1;
    this.fireBoost = 1;
    this.pickupRange = 1;

    this.color = "#62f2ff";
  }

  update(deltaTime, game) {
    const seconds = deltaTime / 1000;

    let dx = 0;
    let dy = 0;

    if (keys.w || keys.arrowup) dy--;
    if (keys.s || keys.arrowdown) dy++;
    if (keys.a || keys.arrowleft) dx--;
    if (keys.d || keys.arrowright) dx++;

    const length = Math.hypot(dx, dy);

    if (length > 0) {
      dx /= length;
      dy /= length;
    }

    let moveSpeed = this.speed;

    if (
      keys.shift &&
      this.stamina > PLAYER_CONFIG.dashCost &&
      this.dashCooldown <= 0 &&
      length > 0
    ) {
      moveSpeed *= PLAYER_CONFIG.dashMultiplier;
      this.stamina -= PLAYER_CONFIG.dashCost;
      this.dashCooldown = 360;
      this.invincible = 180;
      game.shake = Math.max(game.shake, 7);
    }

    this.x += dx * moveSpeed * seconds;
    this.y += dy * moveSpeed * seconds;

    this.x = clamp(this.x, this.r, game.worldWidth - this.r);
    this.y = clamp(this.y, this.r, game.worldHeight - this.r);

    this.stamina = clamp(this.stamina + deltaTime * 0.024, 0, this.maxStamina);
    this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
    this.invincible = Math.max(0, this.invincible - deltaTime);
  }

  takeDamage(amount, game) {
    if (this.invincible > 0) return;

    this.health -= amount;
    this.invincible = 450;
    game.shake = Math.max(game.shake, 16);
    game.flash = 0.7;
  }

  heal(amount) {
    this.health = clamp(this.health + amount, 0, this.maxHealth);
  }

  draw(ctx, camera, mouse, canvasWidth, canvasHeight, weapon) {
    const angle = Math.atan2(
      mouse.y - canvasHeight / 2,
      mouse.x - canvasWidth / 2
    );

    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    ctx.save();

    if (this.invincible > 0) {
      ctx.globalAlpha = 0.65;
    }

    ctx.shadowBlur = 24;
    ctx.shadowColor = "#7bf8ff";

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0b1020";
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.r * 0.62, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(screenX, screenY);
    ctx.rotate(angle);

    ctx.fillStyle = "#dbeafe";
    ctx.fillRect(6, -5, 34, 10);

    ctx.fillStyle = weapon.color;
    ctx.fillRect(30, -3, 18, 6);

    ctx.restore();
  }
}