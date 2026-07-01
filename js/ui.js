export class UI {
  constructor() {
    this.waveText = document.getElementById("waveText");
    this.scoreText = document.getElementById("scoreText");
    this.killsText = document.getElementById("killsText");
    this.weaponText = document.getElementById("weaponText");
    this.ammoText = document.getElementById("ammoText");

    this.healthBar = document.getElementById("healthBar");
    this.staminaBar = document.getElementById("staminaBar");
    this.xpBar = document.getElementById("xpBar");

    this.startScreen = document.getElementById("startScreen");
    this.pauseScreen = document.getElementById("pauseScreen");
    this.upgradeScreen = document.getElementById("upgradeScreen");
    this.gameOverScreen = document.getElementById("gameOverScreen");

    this.finalScore = document.getElementById("finalScore");
    this.finalWave = document.getElementById("finalWave");
    this.finalKills = document.getElementById("finalKills");

    this.toast = document.getElementById("toast");
  }

  update(game, player, weaponManager) {
    const weapon = weaponManager.current;

    this.waveText.textContent = game.wave;
    this.scoreText.textContent = game.score;
    this.killsText.textContent = game.kills;

    this.weaponText.textContent = weapon.name;

    this.ammoText.textContent = weaponManager.reloading
      ? "RELOADING"
      : `${weapon.ammo} / ${weapon.mag}`;

    this.healthBar.style.width = `${(player.health / player.maxHealth) * 100}%`;
    this.staminaBar.style.width = `${(player.stamina / player.maxStamina) * 100}%`;
    this.xpBar.style.width = `${(game.xp / game.xpNeed) * 100}%`;
  }

  hideAllScreens() {
    this.startScreen.classList.remove("active");
    this.pauseScreen.classList.remove("active");
    this.upgradeScreen.classList.remove("active");
    this.gameOverScreen.classList.remove("active");
  }

  showPause() {
    this.pauseScreen.classList.add("active");
  }

  hidePause() {
    this.pauseScreen.classList.remove("active");
  }

  showGameOver(game) {
    this.finalScore.textContent = game.score;
    this.finalWave.textContent = game.wave;
    this.finalKills.textContent = game.kills;
    this.gameOverScreen.classList.add("active");
  }

  showToast(message) {
    this.toast.textContent = message;
    this.toast.classList.add("show");

    clearTimeout(this.toastTimer);

    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove("show");
    }, 1600);
  }
}