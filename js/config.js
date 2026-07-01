export const GAME = {
  worldWidth: 2600,
  worldHeight: 1800,
  backgroundColor: "#070b12",
  maxDeltaTime: 34
};

export const PLAYER_CONFIG = {
  radius: 18,
  speed: 280,
  maxHealth: 100,
  maxStamina: 100,
  dashMultiplier: 3.2,
  dashCost: 24
};

export const WEAPONS = {
  pistol: {
    id: "pistol",
    name: "PISTOL",
    damage: 26,
    fireRate: 280,
    bulletSpeed: 960,
    spread: 0.035,
    mag: 12,
    ammo: 12,
    pellets: 1,
    reload: 750,
    color: "#ffd166",
    unlocked: true
  },

  smg: {
    id: "smg",
    name: "SMG",
    damage: 13,
    fireRate: 75,
    bulletSpeed: 900,
    spread: 0.13,
    mag: 32,
    ammo: 32,
    pellets: 1,
    reload: 1050,
    color: "#7bf8ff",
    unlocked: false
  },

  shotgun: {
    id: "shotgun",
    name: "SHOTGUN",
    damage: 18,
    fireRate: 740,
    bulletSpeed: 760,
    spread: 0.34,
    mag: 6,
    ammo: 6,
    pellets: 7,
    reload: 1200,
    color: "#ff7b9c",
    unlocked: false
  }
};

export const ZOMBIE_TYPES = {
  walker: {
    radius: 19,
    health: 50,
    speed: 95,
    damage: 12,
    color: "#8bc34a",
    score: 70,
    xp: 18
  },

  runner: {
    radius: 15,
    health: 32,
    speed: 165,
    damage: 9,
    color: "#ffcc4d",
    score: 90,
    xp: 22
  },

  brute: {
    radius: 28,
    health: 130,
    speed: 70,
    damage: 22,
    color: "#ff5c5c",
    score: 150,
    xp: 35
  },

  boss: {
    radius: 46,
    health: 520,
    speed: 68,
    damage: 34,
    color: "#a855f7",
    score: 900,
    xp: 160
  }
};