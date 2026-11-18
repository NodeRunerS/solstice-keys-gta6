import * as THREE from 'three';
import { createVehicle } from './vehicle.js';
import { WORLD_SIZE } from './config.js';

export function spawnTraffic(scene, count = 14) {
  const cars = [];
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.75 ? 'sport' : 'sedan';
    const car = createVehicle(type);
    const lane = Math.random() > 0.5 ? WORLD_SIZE.eastX : WORLD_SIZE.westX;
    car.mesh.position.set(lane + (Math.random() - 0.5) * 60, 0, (Math.random() - 0.5) * 100);
    car.heading = Math.random() > 0.5 ? 0 : Math.PI / 2;
    car.speed = 8 + Math.random() * 10;
    car.traffic = true;
    scene.add(car.mesh);
    cars.push(car);
  }
  return cars;
}

export function updateTraffic(cars, dt) {
  for (const car of cars) {
    const fwd = new THREE.Vector3(Math.sin(car.heading), 0, Math.cos(car.heading));
    car.mesh.position.addScaledVector(fwd, car.speed * dt);
    if (Math.abs(car.mesh.position.x) > 220 || Math.abs(car.mesh.position.z) > 120) {
      car.heading += Math.PI;
    }
    car.mesh.rotation.y = car.heading;
  }
}

export function spawnPeds(scene, count = 20) {
  const peds = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.random();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 1.4, 0.3),
      new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(hue, 0.55, 0.55) }),
    );
    body.position.set(
      (Math.random() - 0.5) * 280,
      0.7,
      (Math.random() - 0.5) * 140,
    );
    body.userData.ped = { health: 100, speed: 1.5 + Math.random() };
    scene.add(body);
    peds.push(body);
  }
  return peds;
}

export function updatePeds(peds, playerPos, dt) {
  for (const ped of peds) {
    const wander = new THREE.Vector3((Math.random() - 0.5) * 0.02, 0, (Math.random() - 0.5) * 0.02);
    ped.position.add(wander);
    if (ped.position.distanceTo(playerPos) < 2.5) {
      const away = new THREE.Vector3().subVectors(ped.position, playerPos).normalize();
      ped.position.addScaledVector(away, dt * 2);
    }
  }
}