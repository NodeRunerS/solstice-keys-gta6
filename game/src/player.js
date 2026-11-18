import * as THREE from 'three';
import { PLAYER } from './config.js';

export function createPlayer() {
  const body = new THREE.Group();
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.65, 0.28),
    new THREE.MeshStandardMaterial({ color: 0xff4f6d }),
  );
  torso.position.y = 1.05;
  const legs = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.7, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x243447 }),
  );
  legs.position.y = 0.55;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xd4a574 }),
  );
  head.position.y = 1.52;
  body.add(torso, legs, head);
  body.castShadow = true;

  return {
    mesh: body,
    vel: new THREE.Vector3(),
    onGround: true,
    yaw: 0,
    inVehicle: null,
    health: 100,
    armor: 0,
    weapon: 0,
    ammo: [Infinity, 12, 32, 6, 24],
    cash: 2500,
    respect: 0,
  };
}

export function updatePlayerOnFoot(player, input, cameraYaw, dt) {
  const speed = input.sprint ? PLAYER.sprintSpeed : PLAYER.walkSpeed;
  const move = new THREE.Vector3(input.mx, 0, input.mz);
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(speed * dt);
    const sin = Math.sin(cameraYaw);
    const cos = Math.cos(cameraYaw);
    const wx = move.x * cos + move.z * sin;
    const wz = -move.x * sin + move.z * cos;
    player.mesh.position.x += wx;
    player.mesh.position.z += wz;
    player.yaw = Math.atan2(wx, wz);
    player.mesh.rotation.y = player.yaw;
  }
  if (input.jump && player.onGround) {
    player.vel.y = PLAYER.jumpForce;
    player.onGround = false;
  }
  player.vel.y -= 24 * dt;
  player.mesh.position.y += player.vel.y * dt;
  if (player.mesh.position.y < 0) {
    player.mesh.position.y = 0;
    player.vel.y = 0;
    player.onGround = true;
  }
}

export function mountVehicle(player, car) {
  player.inVehicle = car;
  if (car) car.driver = player;
  player.mesh.visible = false;
}

export function dismountVehicle(player, car) {
  const off = new THREE.Vector3(2.2, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), car.heading);
  player.mesh.position.copy(car.mesh.position).add(off);
  player.mesh.visible = true;
  player.inVehicle = null;
  car.driver = null;
}