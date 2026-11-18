import * as THREE from 'three';
import { WORLD_SIZE } from './config.js';

export function createMissionChain() {
  return {
    active: null,
    completed: 0,
    markers: [
      {
        id: 'delivery',
        title: 'Hot Package',
        desc: 'Deliver the package to Starfish Cay.',
        from: new THREE.Vector3(WORLD_SIZE.eastX, 0, -30),
        to: new THREE.Vector3(0, 0, 25),
        reward: 1200,
      },
      {
        id: 'race',
        title: 'Bridge Run',
        desc: 'Reach Crown Harbor before the timer ends.',
        from: new THREE.Vector3(WORLD_SIZE.eastX, 0, 0),
        to: new THREE.Vector3(WORLD_SIZE.westX + 30, 0, -20),
        reward: 900,
        timer: 55,
      },
      {
        id: 'turf',
        title: 'Undertow Drop',
        desc: 'Secure the dock for The Undertow.',
        from: new THREE.Vector3(-8, 0, -52),
        to: new THREE.Vector3(WORLD_SIZE.westX, 0, 35),
        reward: 1500,
      },
      {
        id: 'hit',
        title: 'Quiet Removal',
        desc: 'Reach the helipad without exceeding 4 stars.',
        from: new THREE.Vector3(WORLD_SIZE.westX - 20, 0, -10),
        to: new THREE.Vector3(0, 0, 8),
        reward: 2000,
        maxStars: 4,
      },
    ],
    meshes: [],
    toast: '',
  };
}

export function spawnMissionMarkers(missions, scene) {
  for (const m of missions.markers) {
    const geo = new THREE.CylinderGeometry(0.8, 0.8, 2.2, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff3dd4,
      emissive: 0xff3dd4,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(m.from);
    mesh.position.y = 1.2;
    mesh.userData.missionId = m.id;
    scene.add(mesh);
    missions.meshes.push(mesh);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.08, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0xffee55, emissive: 0xffcc00, emissiveIntensity: 0.5 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(mesh.position);
    ring.position.y = 0.3;
    scene.add(ring);
  }
}

let interactLatch = false;

export function tryStartMission(missions, playerPos, police) {
  if (missions.active) return null;
  for (let i = 0; i < missions.markers.length; i++) {
    const m = missions.markers[i];
    if (missions.completed > i) continue;
    if (playerPos.distanceTo(m.from) < 3.8) {
      missions.active = { ...m, startTime: performance.now() / 1000 };
      missions.toast = m.title;
      interactLatch = true;
      return missions.active;
    }
  }
  return null;
}

export function updateMission(missions, playerPos, police) {
  if (!missions.active) return null;
  const a = missions.active;
  if (a.maxStars && police.stars > a.maxStars) {
    missions.active = null;
    return { failed: true, title: a.title };
  }
  if (playerPos.distanceTo(a.to) < 6) {
    missions.completed += 1;
    const reward = a.reward;
    missions.active = null;
    return { done: true, reward, title: a.title };
  }
  if (a.timer) {
    const elapsed = performance.now() / 1000 - a.startTime;
    if (elapsed > a.timer) {
      missions.active = null;
      return { failed: true, title: a.title };
    }
    return {
      objective: `${a.desc} (${Math.ceil(a.timer - elapsed)}s)`,
      target: a.to,
    };
  }
  return { objective: a.desc, target: a.to };
}

export function pulseMarkers(missions, time) {
  for (const mesh of missions.meshes) {
    if (mesh.material?.emissiveIntensity != null) {
      mesh.material.emissiveIntensity = 0.55 + Math.sin(time * 3) * 0.35;
    }
  }
}