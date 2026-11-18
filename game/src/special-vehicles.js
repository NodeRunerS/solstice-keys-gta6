import * as THREE from 'three';
import { COLORS } from './config.js';

export function createBoat() {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.7, 5),
    new THREE.MeshStandardMaterial({ color: 0xf0f4ff, metalness: 0.4, roughness: 0.3 }),
  );
  hull.position.y = 0.4;
  g.add(hull);
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.9, 2),
    new THREE.MeshStandardMaterial({ color: COLORS.cyan, emissive: COLORS.cyan, emissiveIntensity: 0.15 }),
  );
  cabin.position.set(0, 1.1, -0.5);
  g.add(cabin);
  return {
    mesh: g,
    type: 'boat',
    speed: 0,
    heading: 0,
    onWater: true,
  };
}

export function createHelicopter() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.1, 3.6),
    new THREE.MeshStandardMaterial({ color: 0x334455, metalness: 0.5, roughness: 0.4 }),
  );
  body.position.y = 2.5;
  g.add(body);
  const rotor = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.08, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x111 }),
  );
  rotor.position.y = 3.3;
  g.add(rotor);
  g.userData.rotor = rotor;
  const tail = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x334455 }),
  );
  tail.position.set(0, 2.6, -2.8);
  g.add(tail);
  return {
    mesh: g,
    type: 'heli',
    speed: 0,
    heading: 0,
    altitude: 2.5,
    rotor,
  };
}

export function updateBoat(boat, input, dt) {
  const thrust = input.throttle ? 22 : input.brake ? -18 : 0;
  boat.speed = THREE.MathUtils.lerp(boat.speed, thrust, dt * 2);
  boat.heading += input.steer * 1.4 * dt;
  const fwd = new THREE.Vector3(Math.sin(boat.heading), 0, Math.cos(boat.heading));
  boat.mesh.position.addScaledVector(fwd, boat.speed * dt);
  boat.mesh.position.y = -0.2;
  boat.mesh.rotation.y = boat.heading;
}

export function updateHelicopter(heli, input, dt) {
  if (input.throttle) heli.speed = THREE.MathUtils.lerp(heli.speed, 28, dt);
  else heli.speed *= 0.95;
  heli.heading += input.steer * 1.8 * dt;
  if (input.jump) heli.altitude = Math.min(35, heli.altitude + 12 * dt);
  if (input.brake) heli.altitude = Math.max(2.5, heli.altitude - 10 * dt);
  const fwd = new THREE.Vector3(Math.sin(heli.heading), 0, Math.cos(heli.heading));
  heli.mesh.position.addScaledVector(fwd, heli.speed * dt);
  heli.mesh.position.y = heli.altitude;
  heli.mesh.rotation.y = heli.heading;
  if (heli.mesh.userData.rotor) heli.mesh.userData.rotor.rotation.y += dt * 18;
}