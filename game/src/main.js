import * as THREE from 'three';
import { bindInput, down, consumeMouse } from './input.js';
import { CITY, WEAPONS, WANTED, RADIO } from './config.js';
import { buildWorld, createSkyDome, setTimeOfDay, setNightLights, updateTrafficLights } from './world.js';
import { createPlayer, updatePlayerOnFoot, mountVehicle, dismountVehicle } from './player.js';
import { createVehicle, updateVehicle } from './vehicle.js';
import { createPoliceSystem, addCrimeHeat, updatePolice } from './police.js';
import { createMissionChain, spawnMissionMarkers, tryStartMission, updateMission, pulseMarkers } from './missions.js';
import { updateCombat, switchWeapon, reloadWeapon } from './combat.js';
import { spawnTraffic, updateTraffic, spawnPeds, updatePeds } from './traffic.js';
import { initHud, updateHud, showToast } from './hud.js';
import { showMainMenu, showPause } from './menu.js';
import { createInteractables, nearestInteractable, tryGunShop, tryCarWash, trySafehouse } from './shops.js';
import { createBoat, createHelicopter, updateBoat, updateHelicopter } from './special-vehicles.js';
import { initAudio, playEngine, startRadioBuzz } from './audio.js';
import { loadSave, writeSave, applySave, snapshotSave, hasSave } from './save.js';
import { applyShotMode } from './shots.js';

const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xc4dff5, 90, 340);

const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 520);

const sun = new THREE.DirectionalLight(0xfff0d0, 1.35);
sun.position.set(80, 120, 40);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 300;
sun.shadow.camera.left = -140;
sun.shadow.camera.right = 140;
sun.shadow.camera.top = 140;
sun.shadow.camera.bottom = -140;
scene.add(sun);
scene.add(new THREE.HemisphereLight(0x9ecfff, 0xf0c090, 0.45));

buildWorld(scene);
const sky = createSkyDome(scene);
const player = createPlayer();
player.mesh.position.set(118, 0, -18);
scene.add(player.mesh);

const police = createPoliceSystem();
const missions = createMissionChain();
spawnMissionMarkers(missions, scene);
const traffic = spawnTraffic(scene, 18);
const peds = spawnPeds(scene, 28);
const sites = createInteractables();

const parkedCars = [];
const specials = { boat: null, heli: null };
for (let i = 0; i < 8; i++) {
  const car = createVehicle(i % 3 === 0 ? 'sport' : 'sedan');
  car.mesh.position.set(96 + (i % 4) * 9, 0, 24 - Math.floor(i / 4) * 14);
  car.heading = -0.35 + i * 0.05;
  car.parked = true;
  scene.add(car.mesh);
  parkedCars.push(car);
}
specials.boat = createBoat();
specials.boat.mesh.position.set(-12, -0.2, -52);
scene.add(specials.boat.mesh);
specials.heli = createHelicopter();
specials.heli.mesh.position.set(0, 0.1, 10);
specials.heli.parked = true;
scene.add(specials.heli.mesh);

let keysMouse = false;
canvas.addEventListener('mousedown', (e) => {
  if (e.button === 0) keysMouse = true;
  initAudio();
});
canvas.addEventListener('mouseup', () => { keysMouse = false; });

bindInput(canvas);
initHud();

const hour = { value: 17.5 };
let paused = false;
const playing = { value: false };
let cameraYaw = 0;
let cameraPitch = 0.28;
let cameraModeClassic = false;
let enterCooldown = 0;
let escLatch = false;
let radioIndex = 0;
let qLatch = false;
let eLatch = false;
let vLatch = false;
let mapOpen = false;

function formatTime(h) {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h % 1) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function districtAt(pos) {
  if (pos.x > 40) return CITY.eastDistrict;
  if (pos.x < -60) return CITY.westDistrict;
  if (Math.hypot(pos.x, pos.z) < 45) return CITY.cay;
  return 'Bayspan';
}

function nearestVehicle() {
  let best = null;
  let d = 3.5;
  const pos = player.mesh.position;
  for (const car of [...parkedCars, ...traffic]) {
    if (car.driver) continue;
    const dist = car.mesh.position.distanceTo(pos);
    if (dist < d) { d = dist; best = car; }
  }
  if (!player.inVehicle) {
    for (const key of ['boat', 'heli']) {
      const v = specials[key];
      if (v.driver) continue;
      const dist = v.mesh.position.distanceTo(pos);
      if (dist < (key === 'heli' ? 5 : 4) && dist < d) { d = dist; best = v; }
    }
  }
  return best;
}

function mountDemoCar() {
  const car = createVehicle('sport');
  car.mesh.position.set(118, 0, -10);
  car.heading = -0.2;
  scene.add(car.mesh);
  mountVehicle(player, car);
  return car;
}

const shotCtx = {
  player,
  police,
  hour,
  playing,
  missions,
  mountDemoCar,
  menu: {
    show: () => showMainMenu(() => startGame(false), () => startGame(true)),
    hide: () => {
      document.getElementById('menu').classList.add('hidden');
      document.getElementById('menu').innerHTML = '';
    },
  },
};
applyShotMode(new URLSearchParams(location.search), shotCtx);

function updateCamera(targetPos, dt) {
  const { dx, dy } = consumeMouse();
  if (playing.value && !paused) {
    cameraYaw -= dx * 0.0022;
    cameraPitch = THREE.MathUtils.clamp(cameraPitch - dy * 0.002, 0.05, 0.65);
  }
  const inAir = player.inVehicle?.type === 'heli';
  const dist = player.inVehicle ? (inAir ? 14 : 8.5) : (cameraModeClassic ? 11 : 5.5);
  const height = inAir ? 6 : player.inVehicle ? 2.8 : 2.2;
  const pitch = cameraModeClassic ? 0.85 : cameraPitch;
  const offset = new THREE.Vector3(
    Math.sin(cameraYaw) * Math.cos(pitch) * dist,
    Math.sin(pitch) * dist + height,
    Math.cos(cameraYaw) * Math.cos(pitch) * dist,
  );
  const lookAt = targetPos.clone().add(new THREE.Vector3(0, inAir ? 1.5 : 1.2, 0));
  camera.position.lerp(lookAt.clone().add(offset), 1 - Math.exp(-5.5 * dt));
  camera.lookAt(lookAt);
}

function persist() {
  writeSave(snapshotSave(player, missions, police));
}

function startGame(continuing) {
  playing.value = true;
  if (continuing && hasSave()) {
    applySave(player, missions, police);
    showToast('Save loaded.');
  } else {
    player.mesh.position.set(118, 0, -18);
    player.cash = 2500;
    player.health = 100;
    missions.completed = 0;
    police.heat = 0;
    police.stars = 0;
  }
  document.getElementById('status').textContent = `${CITY.name} — Rio Calder`;
}

function handleInteract(site) {
  if (!site) return;
  if (site.kind === 'gun') showToast(tryGunShop(player, site).msg);
  else if (site.kind === 'wash') showToast(tryCarWash(player, site, player.inVehicle).msg);
  else if (site.kind === 'safehouse') showToast(trySafehouse(player, police, persist).msg);
  else if (site.kind === 'dock' && !player.inVehicle) showToast('Marina: board the speedboat with F.');
  else if (site.kind === 'helipad' && !player.inVehicle) showToast('Helipad: take the news chopper with F.');
}

function gameLoop(now) {
  requestAnimationFrame(gameLoop);
  const dt = Math.min(0.05, (now - (gameLoop.last || now)) / 1000);
  gameLoop.last = now;
  resize();

  if (down('escape')) {
    if (!escLatch && playing.value) {
      escLatch = true;
      paused = !paused;
      if (paused) showPause(() => { paused = false; });
      else {
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('menu').innerHTML = '';
      }
    }
  } else escLatch = false;

  if (!playing.value || paused) {
    renderer.render(scene, camera);
    return;
  }

  hour.value += dt * 0.035;
  if (hour.value > 24) hour.value = 6;
  const isDay = setTimeOfDay(sky, sun, hour.value);
  setNightLights(!isDay);
  updateTrafficLights(dt);
  pulseMarkers(missions, now * 0.001);

  const input = {
    mx: (down('d') || down('arrowright') ? 1 : 0) - (down('a') || down('arrowleft') ? 1 : 0),
    mz: (down('s') || down('arrowdown') ? 1 : 0) - (down('w') || down('arrowup') ? 1 : 0),
    sprint: down('shift'),
    jump: down(' ') && !player.inVehicle,
    interact: down('e'),
    enterVeh: down('f'),
    throttle: down('w') || down('arrowup'),
    brake: down('s') || down('arrowdown'),
    brakeDrift: down(' ') && !!player.inVehicle,
    steer: (down('d') || down('arrowright') ? 1 : 0) - (down('a') || down('arrowleft') ? 1 : 0),
    fire: keysMouse,
    night: !isDay,
  };

  for (let i = 0; i <= 4; i++) if (down(String(i))) switchWeapon(player, i);
  if (down('r')) reloadWeapon(player);
  if (down('v') && !vLatch) {
    cameraModeClassic = !cameraModeClassic;
    vLatch = true;
  }
  if (!down('v')) vLatch = false;
  if (down('m') && !mapOpen) {
    mapOpen = true;
    showToast('Radar active — explore the islands.');
  }
  if (!down('m')) mapOpen = false;

  if (down('q') && !qLatch) {
    radioIndex = (radioIndex + RADIO.length - 1) % RADIO.length;
    startRadioBuzz(radioIndex);
    showToast(RADIO[radioIndex].name);
    qLatch = true;
  }
  if (!down('q')) qLatch = false;

  if (down('e') && !eLatch) {
    const site = nearestInteractable(sites, player.mesh.position, 4.2);
    const nearMission = missions.markers.some(
      (m, i) => missions.completed <= i && player.mesh.position.distanceTo(m.from) < 4,
    );
    if (site && !nearMission && !missions.active) handleInteract(site);
    else tryStartMission(missions, player.mesh.position, police);
    eLatch = true;
  }
  if (!down('e')) eLatch = false;

  enterCooldown -= dt;

  if (player.inVehicle) {
    const v = player.inVehicle;
    if (v.type === 'boat') updateBoat(v, input, dt);
    else if (v.type === 'heli') updateHelicopter(v, input, dt);
    else updateVehicle(v, input, dt);
    if (v.speed) playEngine(Math.abs(v.speed));
    if (input.enterVeh && enterCooldown <= 0) {
      dismountVehicle(player, v);
      scene.add(player.mesh);
      v.parked = v.type !== 'cop';
      enterCooldown = 0.55;
    }
  } else {
    updatePlayerOnFoot(player, input, cameraYaw, dt);
    if (input.enterVeh && enterCooldown <= 0) {
      const v = nearestVehicle();
      if (v) {
        mountVehicle(player, v);
        if (v.type === 'sedan' || v.type === 'sport') addCrimeHeat(police, WANTED.heatCarJack);
        v.parked = false;
        enterCooldown = 0.6;
      }
    }
  }

  updatePolice(police, player, scene, dt);
  updateTraffic(traffic, dt);
  updatePeds(peds, player.mesh.position, dt);
  updateCombat(player, police, input, camera, scene, dt);

  const missionState = updateMission(missions, player.mesh.position, police);
  if (missionState?.done) {
    player.cash += missionState.reward;
    player.respect += 120;
    showToast(`${missionState.title} +$${missionState.reward}`);
    persist();
  }
  if (missionState?.failed) showToast(`${missionState.title} failed.`);

  if (player.health <= 0) {
    player.health = 100;
    police.heat = 0.3;
    player.mesh.position.set(0, 0, 32);
    showToast('Busted — wake up at safehouse.');
  }

  const targetPos = player.inVehicle ? player.inVehicle.mesh.position : player.mesh.position;
  updateCamera(targetPos, dt);

  const w = WEAPONS[player.weapon];
  const ammoText = Number.isFinite(w.mag) ? `${player.ammo[player.weapon]}/${w.mag}` : '∞';
  const nearSite = nearestInteractable(sites, player.mesh.position, 5);
  let hint = districtAt(targetPos);
  if (player.inVehicle) hint = `F exit · Space drift · ${districtAt(targetPos)}`;
  else if (nearestVehicle()) hint = 'F enter vehicle · E interact / mission';
  else if (nearSite) hint = `${nearSite.label} — press E`;

  updateHud({
    dt,
    player,
    police,
    traffic,
    mission: missionState,
    missionTarget: missionState?.target,
    missionIdle: missions.completed >= missions.markers.length ? 'All jobs cleared.' : 'Find pink mission markers.',
    gameTime: formatTime(hour.value),
    weaponName: w.name,
    ammoText,
    radioIndex,
    playerYaw: player.inVehicle ? player.inVehicle.heading : player.yaw,
    district: districtAt(targetPos),
    hint,
  });

  renderer.render(scene, camera);
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

if (!new URLSearchParams(location.search).get('shot')) {
  showMainMenu(() => startGame(false), () => startGame(true));
} else {
  playing.value = true;
}

requestAnimationFrame(gameLoop);