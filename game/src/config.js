/** Solstice Keys — palette & tuning (no external IP). */
export const CITY = {
  name: 'Solstice Keys',
  eastDistrict: 'Coral Strand',
  westDistrict: 'Crown Harbor',
  cay: 'Starfish Cay',
};

export const RADIO = [
  { name: 'Wave 96', style: 'synth' },
  { name: 'Heat FM', style: 'funk' },
  { name: 'Tide Talk', style: 'talk' },
  { name: 'Rio Rock', style: 'rock' },
];

export const COLORS = {
  pink: 0xff5a9a,
  cyan: 0x2ee8ff,
  orange: 0xff9e3d,
  purple: 0x5b2d8e,
  sand: 0xf4d9a8,
  water: 0x2ec4b6,
  asphalt: 0x2a2a32,
  skyDayTop: 0x87ceeb,
  skyDayBottom: 0xffd4a8,
  skyNightTop: 0x12081f,
  skyNightBottom: 0x4a1942,
};

export const PLAYER = {
  walkSpeed: 7.5,
  sprintSpeed: 13,
  jumpForce: 9,
  height: 1.75,
  radius: 0.35,
};

export const VEHICLE = {
  maxSpeed: 42,
  accel: 28,
  brake: 35,
  steer: 2.4,
  grip: 0.92,
  driftGrip: 0.55,
};

export const WANTED = {
  maxStars: 6,
  decayPerSec: 0.08,
  heatCarJack: 0.35,
  heatShoot: 0.25,
  heatHitPed: 0.15,
};

export const WEAPONS = [
  { id: 'fists', name: 'Fists', damage: 8, range: 2.2, rate: 4, mag: Infinity, auto: false },
  { id: 'kestrel9', name: 'Kestrel 9', damage: 18, range: 85, rate: 6, mag: 12, auto: true },
  { id: 'strom45', name: 'Strom 45', damage: 11, range: 70, rate: 10, mag: 32, auto: true },
  { id: 'boomstick', name: 'Boomstick', damage: 42, range: 35, rate: 1.2, mag: 6, auto: false },
  { id: 'tide', name: 'Tide Rifle', damage: 26, range: 120, rate: 4.5, mag: 24, auto: true },
];

export const WORLD_SIZE = {
  eastX: 120,
  westX: -140,
  bridgeZ: 0,
  waterY: -0.05,
};