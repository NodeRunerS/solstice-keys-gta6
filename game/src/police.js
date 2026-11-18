import * as THREE from 'three';
import { WANTED } from './config.js';
import { createVehicle } from './vehicle.js';
import { createHelicopter } from './special-vehicles.js';
import { playSiren } from './audio.js';

export function createPoliceSystem() {
  return {
    heat: 0,
    stars: 0,
    units: [],
    helis: [],
    spawnTimer: 0,
    sirenTimer: 0,
  };
}

export function addCrimeHeat(police, amount) {
  police.heat = Math.min(1, police.heat + amount);
  police.stars = Math.min(WANTED.maxStars, Math.ceil(police.heat * WANTED.maxStars));
}

export function updatePolice(police, player, scene, dt) {
  if (police.heat > 0 && police.stars === 0) police.stars = 1;
  if (police.stars === 0 && !player.inVehicle) {
    police.heat = Math.max(0, police.heat - WANTED.decayPerSec * dt);
  } else if (police.stars > 0) {
    police.heat = Math.max(police.stars / WANTED.maxStars - 0.01, police.heat - WANTED.decayPerSec * 0.35 * dt);
    police.stars = Math.max(0, Math.ceil(police.heat * WANTED.maxStars));
  }

  police.spawnTimer -= dt;
  police.sirenTimer -= dt;
  if (police.stars > 0 && police.sirenTimer <= 0) {
    police.sirenTimer = 2.2;
    playSiren();
  }

  const targetCars = Math.min(police.stars, 4);
  while (police.units.length < targetCars && police.spawnTimer <= 0) {
    police.spawnTimer = 3.2;
    const car = createVehicle('cop');
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 30;
    const pos = player.inVehicle?.mesh?.position ?? player.mesh.position;
    car.mesh.position.set(
      pos.x + Math.cos(angle) * dist,
      0,
      pos.z + Math.sin(angle) * dist,
    );
    car.heading = angle + Math.PI;
    car.aiTarget = player;
    scene.add(car.mesh);
    police.units.push(car);
  }

  const targetHelis = police.stars >= 5 ? Math.min(police.stars - 4, 2) : 0;
  while (police.helis.length < targetHelis) {
    const heli = createHelicopter();
    const pos = player.inVehicle?.mesh?.position ?? player.mesh.position;
    heli.mesh.position.set(pos.x + 40, 25, pos.z + 20);
    heli.aiTarget = player;
    scene.add(heli.mesh);
    police.helis.push(heli);
  }
  while (police.helis.length > targetHelis) {
    const h = police.helis.pop();
    scene.remove(h.mesh);
  }

  for (const unit of police.units) {
    if (!unit.aiTarget) continue;
    const target = unit.aiTarget.inVehicle?.mesh ?? unit.aiTarget.mesh;
    const to = new THREE.Vector3().subVectors(target.position, unit.mesh.position);
    const dist = to.length();
    to.normalize();
    const desired = Math.atan2(to.x, to.z);
    let diff = desired - unit.heading;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    unit.heading += diff * dt * 2.2;
    unit.speed = THREE.MathUtils.lerp(unit.speed ?? 0, police.stars > 3 ? 36 : 28, dt);
    const fwd = new THREE.Vector3(Math.sin(unit.heading), 0, Math.cos(unit.heading));
    unit.mesh.position.addScaledVector(fwd, unit.speed * dt);
    unit.mesh.rotation.y = unit.heading;
    if (dist < 4 && !unit.aiTarget.inVehicle) unit.aiTarget.health -= 8 * dt;
  }

  for (const heli of police.helis) {
    if (!heli.aiTarget) continue;
    const target = heli.aiTarget.inVehicle?.mesh ?? heli.aiTarget.mesh;
    heli.mesh.position.x = THREE.MathUtils.lerp(heli.mesh.position.x, target.position.x + 30, dt * 0.6);
    heli.mesh.position.z = THREE.MathUtils.lerp(heli.mesh.position.z, target.position.z + 15, dt * 0.6);
    heli.mesh.position.y = 28 + Math.sin(performance.now() * 0.002) * 2;
    if (heli.mesh.userData.rotor) heli.mesh.userData.rotor.rotation.y += dt * 22;
  }
}