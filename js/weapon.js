import { WEAPONS } from "./config.js";
import { Bullet } from "./bullet.js";
import { rand } from "./utils.js";

export class WeaponManager {
  constructor() {
    this.weapons = structuredClone(WEAPONS);
    this.selected = "pistol";
    this.reloading = false;
    this.reloadTimer = 0;
  }

  get current() {
    return this.weapons[this.selected];
  }

  switch(id) {
    if (!this.weapons[id]) return false;
    if (!this.weapons[id].unlocked) return false;
    if (this.reloading) return false;

    this.selected = id;
    return true;
  }

  unlock(id) {
    if (this.weapons[id]) {
      this.weapons[id].unlocked = true;
    }
  }

  reload() {
    const weapon = this.current;

    if (this.reloading) return;
    if (weapon.ammo === weapon.mag) return;

    this.reloading = true;
    this.reloadTimer = weapon.reload;
  }

  update(deltaTime) {
    if (!this.reloading) return;

    this.reloadTimer -= deltaTime;

    if (this.reloadTimer <= 0) {
      this.current.ammo = this.current.mag;
      this.reloading = false;
    }
  }

  shoot(player, mouse, camera, canvasWidth, canvasHeight, game) {
    const weapon = this.current;

    if (this.reloading) return [];

    if (!weapon.lastShot) {
      weapon.lastShot = -9999;
    }

    const fireDelay = weapon.fireRate / player.fireBoost;

    if (game.time - weapon.lastShot < fireDelay) return [];

    if (weapon.ammo <= 0) {
      this.reload();
      return [];
    }

    weapon.lastShot = game.time;
    weapon.ammo--;

    const bullets = [];
    const baseAngle = Math.atan2(
      mouse.y - canvasHeight / 2,
      mouse.x - canvasWidth / 2
    );

    for (let i = 0; i < weapon.pellets; i++) {
      const angle = baseAngle + rand(-weapon.spread, weapon.spread);

      bullets.push(
        new Bullet(
          player.x + Math.cos(angle) * 26,
          player.y + Math.sin(angle) * 26,
          angle,
          weapon,
          player.damageBoost
        )
      );
    }

    game.shake = Math.max(game.shake, weapon.id === "shotgun" ? 9 : 3);

    return bullets;
  }

  refillAllAmmo() {
    Object.values(this.weapons).forEach((weapon) => {
      weapon.ammo = weapon.mag;
    });
  }

  upgradeMagazines() {
    Object.values(this.weapons).forEach((weapon) => {
      weapon.mag = Math.ceil(weapon.mag * 1.2);
      weapon.ammo = weapon.mag;
    });
  }
}