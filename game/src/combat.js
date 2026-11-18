import * as THREE from 'three';
import { WEAPONS, WANTED } from './config.js';
import { addCrimeHeat } from './police.js';
import { playGun } from './audio.js';

export function fireWeapon(player, police, camera, scene) {
  const w = WEAPONS[player.weapon];
  if (w.id === 'fists') return false;
  if (player.ammo[player.weapon] <= 0) return false;
  const origin = player.inVehicle
    ? player.inVehicle.mesh.position.clone().add(new THREE.Vector3(0, 1.2, 0))
    : player.mesh.position.clone().add(new THREE.Vector3(0, 1.4, 0));
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  const ray = new THREE.Raycaster(origin, dir, 0, w.range);
  const hits = ray.intersectObjects(scene.children, true);
  if (hits.length) {
    const hit = hits[0];
    if (hit.object.userData?.ped) hit.object.userData.ped.health -= w.damage;
  }
  player.ammo[player.weapon] -= 1;
  addCrimeHeat(police, WANTED.heatShoot * 0.2);
  playGun();
  return true;
}

let fireCooldown = 0;

export function updateCombat(player, police, input, camera, scene, dt) {
  fireCooldown -= dt;
  const w = WEAPONS[player.weapon];
  if (!input.fire || fireCooldown > 0) return;
  const rate = w.rate;
  fireCooldown = 1 / rate;
  if (player.weapon === 0) {
    addCrimeHeat(police, WANTED.heatHitPed * 0.08);
    return;
  }
  fireWeapon(player, police, camera, scene);
}

export function switchWeapon(player, index) {
  if (index < 0 || index >= WEAPONS.length) return;
  if (index > 1 && player.ammo[index] <= 0) return;
  player.weapon = index;
}

export function reloadWeapon(player) {
  const w = WEAPONS[player.weapon];
  if (!Number.isFinite(w.mag)) return;
  player.ammo[player.weapon] = w.mag;
}