import { WEAPONS } from './config.js';
import { playUi } from './audio.js';

/** World interactable sites — gun shop, car wash, safehouse. */
export function createInteractables() {
  return [
    {
      id: 'atlantic-arms',
      label: 'ATLANTIC ARMS',
      pos: { x: -125, y: 0, z: -25 },
      radius: 6,
      kind: 'gun',
    },
    {
      id: 'salt-spray',
      label: 'SALT SPRAY WASH',
      pos: { x: 95, y: 0, z: 20 },
      radius: 5,
      kind: 'wash',
    },
    {
      id: 'rio-safehouse',
      label: 'Rio Safehouse',
      pos: { x: 0, y: 0, z: 32 },
      radius: 4,
      kind: 'safehouse',
    },
    {
      id: 'bayspan-dock',
      label: 'Bayspan Marina',
      pos: { x: -10, y: 0, z: -55 },
      radius: 6,
      kind: 'dock',
    },
    {
      id: 'cay-helipad',
      label: 'Starfish Helipad',
      pos: { x: 0, y: 0, z: 8 },
      radius: 7,
      kind: 'helipad',
    },
  ];
}

export function nearestInteractable(list, pos, maxDist = 4) {
  let best = null;
  let d = maxDist;
  for (const site of list) {
    const dist = Math.hypot(pos.x - site.pos.x, pos.z - site.pos.z);
    if (dist < d) {
      d = dist;
      best = site;
    }
  }
  return best;
}

export function tryGunShop(player, site) {
  if (site?.kind !== 'gun') return null;
  const prices = [0, 0, 800, 1200, 2500];
  let bought = null;
  for (let i = 2; i < WEAPONS.length; i++) {
    if (player.ammo[i] > 0) continue;
    if (player.cash >= prices[i]) {
      player.cash -= prices[i];
      player.ammo[i] = WEAPONS[i].mag;
      bought = WEAPONS[i].name;
      playUi();
    }
  }
  if (!bought) return { msg: 'Atlantic Arms: all stocked or low cash.' };
  return { msg: `Purchased ${bought}` };
}

export function tryCarWash(player, site, vehicle) {
  if (site?.kind !== 'wash') return null;
  if (player.cash < 50) return { msg: 'Wash $50 — not enough cash.' };
  player.cash -= 50;
  playUi();
  if (vehicle?.mesh) {
    vehicle.mesh.traverse((o) => {
      if (o.isMesh && o.material?.color) o.material.color.offsetHSL(0, 0, 0.08);
    });
  }
  return { msg: 'Salt Spray Wash: shine restored.' };
}

export function trySafehouse(player, police, onSave) {
  police.heat = Math.max(0, police.heat - 0.5);
  police.stars = Math.max(0, Math.ceil(police.heat * 6));
  onSave();
  playUi();
  return { msg: 'Safehouse: game saved. Heat dropped.' };
}