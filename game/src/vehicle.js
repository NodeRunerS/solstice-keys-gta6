import * as THREE from 'three';
import { VEHICLE, COLORS } from './config.js';

export function createVehicle(type = 'sedan') {
  const g = new THREE.Group();
  const bodyColor = type === 'sport' ? COLORS.orange : type === 'cop' ? 0x223355 : 0x2ec4b6;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(type === 'sport' ? 1.9 : 2.1, 0.6, 4.2),
    new THREE.MeshStandardMaterial({ color: bodyColor, metalness: 0.55, roughness: 0.25 }),
  );
  body.position.y = 0.55;
  g.add(body);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.55, 2.1),
    new THREE.MeshStandardMaterial({ color: 0x111822, metalness: 0.7, roughness: 0.2 }),
  );
  cabin.position.set(0, 1.05, -0.2);
  g.add(cabin);
  const wheels = [];
  for (const [x, z] of [
    [-0.9, 1.4],
    [0.9, 1.4],
    [-0.9, -1.4],
    [0.9, -1.4],
  ]) {
    const w = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0x111 }),
    );
    w.rotation.z = Math.PI / 2;
    w.position.set(x, 0.35, z);
    g.add(w);
    wheels.push(w);
  }
  const headlights = new THREE.SpotLight(0xfff2d0, 0, 35, 0.6, 0.5);
  headlights.position.set(0, 0.7, 2.1);
  headlights.target.position.set(0, 0, 8);
  g.add(headlights);
  g.add(headlights.target);

  return {
    mesh: g,
    type,
    speed: 0,
    steer: 0,
    heading: 0,
    headlights,
    driver: null,
  };
}

export function updateVehicle(car, input, dt) {
  const handbrake = input.brakeDrift;
  const accel = input.throttle ? VEHICLE.accel : input.brake ? -VEHICLE.brake : 0;
  if (input.throttle) car.speed = THREE.MathUtils.lerp(car.speed, VEHICLE.maxSpeed, dt * 0.8);
  else if (input.brake) car.speed = THREE.MathUtils.lerp(car.speed, 0, dt * 1.2);
  else car.speed *= 0.98;

  if (Math.abs(car.speed) > 0.5) {
    const grip = handbrake ? VEHICLE.driftGrip : VEHICLE.grip;
    car.heading += input.steer * VEHICLE.steer * grip * dt * Math.sign(car.speed);
  }
  const fwd = new THREE.Vector3(Math.sin(car.heading), 0, Math.cos(car.heading));
  car.mesh.position.addScaledVector(fwd, car.speed * dt);
  car.mesh.rotation.y = car.heading;
  car.headlights.intensity = input.night ? 2.2 : 0;
}