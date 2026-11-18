import * as THREE from 'three';
import { COLORS, WORLD_SIZE } from './config.js';

/** Builds islands, roads, props — original "Solstice Keys" layout. */
export function buildWorld(scene) {
  const group = new THREE.Group();
  group.name = 'world';

  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 900, 1, 1),
    new THREE.MeshStandardMaterial({
      color: COLORS.water,
      metalness: 0.65,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = WORLD_SIZE.waterY;
  group.add(water);

  addIsland(group, WORLD_SIZE.eastX, 90, COLORS.sand, 0xe8b4cb, 'east');
  addIsland(group, WORLD_SIZE.westX, 110, 0x9aa0a8, 0x7a8cff, 'west');
  addIsland(group, 0, 38, 0xc9f0c9, 0xffecd6, 'cay');

  buildBridges(group);
  scatterPalmTrees(group, WORLD_SIZE.eastX, 70);
  scatterStreetLights(group);
  addBillboards(group);
  addShops(group);
  addTrafficLights(group);

  scene.add(group);
  return { group, water };
}

function addIsland(parent, cx, radius, groundColor, buildingTint, tag) {
  const ground = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius + 8, 3, 48),
    new THREE.MeshStandardMaterial({ color: groundColor, roughness: 0.9 }),
  );
  ground.position.set(cx, 0, 0);
  parent.add(ground);

  const grid = tag === 'east' ? 7 : tag === 'west' ? 9 : 4;
  const spacing = (radius * 1.4) / grid;
  for (let i = -grid; i <= grid; i++) {
    for (let j = -grid; j <= grid; j++) {
      if (Math.hypot(i, j) > grid * 0.95) continue;
      const bx = cx + i * spacing;
      const bz = j * spacing;
      if (Math.abs(bz) < 12 && Math.abs(bx - cx) < 18 && tag !== 'cay') continue;
      const h = 6 + Math.random() * (tag === 'west' ? 45 : 22);
      const w = 4 + Math.random() * 5;
      const d = 4 + Math.random() * 5;
      const b = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(buildingTint).offsetHSL(0, 0, (Math.random() - 0.5) * 0.08),
          roughness: 0.55,
          metalness: 0.1,
        }),
      );
      b.position.set(bx, h / 2 + 1.2, bz);
      b.castShadow = true;
      b.receiveShadow = true;
      parent.add(b);
      if (tag === 'east' && Math.random() > 0.6) {
        const neon = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.9, 0.4, 0.2),
          new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? COLORS.pink : COLORS.cyan,
            emissive: Math.random() > 0.5 ? COLORS.pink : COLORS.cyan,
            emissiveIntensity: 1.2,
          }),
        );
        neon.position.set(bx, h * 0.35 + 1.2, bz + d / 2 + 0.12);
        parent.add(neon);
      }
    }
  }

  const roadMat = new THREE.MeshStandardMaterial({ color: COLORS.asphalt, roughness: 0.85 });
  const road = new THREE.Mesh(new THREE.BoxGeometry(radius * 1.6, 0.15, 8), roadMat);
  road.position.set(cx, 1.35, 0);
  road.receiveShadow = true;
  parent.add(road);
  const road2 = new THREE.Mesh(new THREE.BoxGeometry(8, 0.15, radius * 1.4), roadMat);
  road2.position.set(cx, 1.35, 0);
  parent.add(road2);
}

function buildBridges(parent) {
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0xb8c0cc, metalness: 0.4, roughness: 0.5 });
  for (let z = -20; z <= 20; z += 40) {
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(130, 1.2, 10), bridgeMat);
    bridge.position.set((WORLD_SIZE.eastX + WORLD_SIZE.westX) / 2, 1.8, z);
    parent.add(bridge);
    for (let i = 0; i < 6; i++) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 8), bridgeMat);
      pillar.position.set(-40 + i * 16, -2, z);
      parent.add(pillar);
    }
  }
}

function scatterPalmTrees(parent, cx, spread) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4423 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, side: THREE.DoubleSide });
  for (let i = 0; i < 48; i++) {
    const x = cx + (Math.random() - 0.5) * spread * 2;
    const z = (Math.random() - 0.5) * spread * 1.6;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 4.5), trunkMat);
    trunk.position.set(x, 3.6, z);
    parent.add(trunk);
    const leaves = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.5, 6), leafMat);
    leaves.position.set(x, 6.2, z);
    parent.add(leaves);
  }
}

const streetLights = [];

function scatterStreetLights(parent) {
  const positions = [
    [WORLD_SIZE.eastX - 30, 0, 25],
    [WORLD_SIZE.eastX + 20, 0, -35],
    [WORLD_SIZE.westX - 25, 0, 30],
    [WORLD_SIZE.westX + 40, 0, -20],
    [5, 0, 45],
    [WORLD_SIZE.eastX, 0, 50],
  ];
  for (const [x, , z] of positions) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 5),
      new THREE.MeshStandardMaterial({ color: 0x555a66 }),
    );
    pole.position.set(x, 3.5, z);
    parent.add(pole);
    const lamp = new THREE.PointLight(0xffe4b5, 0, 28, 2);
    lamp.position.set(x, 6, z);
    parent.add(lamp);
    streetLights.push(lamp);
  }
}

export function setNightLights(isNight) {
  const intensity = isNight ? 1.4 : 0;
  for (const l of streetLights) l.intensity = intensity;
}

function addBillboards(parent) {
  const texts = ['SUNSET COLA', 'CAYO RADIO', 'STAR AUTO', 'NEON WASH'];
  const spots = [
    [WORLD_SIZE.eastX + 35, 12, -30],
    [WORLD_SIZE.westX - 50, 22, 15],
    [WORLD_SIZE.eastX - 15, 10, 40],
    [WORLD_SIZE.westX + 30, 18, -40],
  ];
  for (let i = 0; i < spots.length; i++) {
    const [x, y, z] = spots[i];
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(10, 4, 0.3),
      new THREE.MeshStandardMaterial({
        color: 0x222233,
        emissive: i % 2 ? COLORS.pink : COLORS.cyan,
        emissiveIntensity: 0.35,
      }),
    );
    board.position.set(x, y, z);
    parent.add(board);
    board.userData.label = texts[i];
  }
}

function addShops(parent) {
  const gunShop = makeBuildingBlock(0xff6e40, WORLD_SIZE.westX + 15, 8, -25, 'ATLANTIC ARMS');
  const carWash = makeBuildingBlock(COLORS.cyan, WORLD_SIZE.eastX - 25, 6, 20, 'SALT SPRAY WASH');
  parent.add(gunShop, carWash);
  return { gunShop, carWash };
}

function makeBuildingBlock(color, x, h, z, label) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(12, h, 8),
    new THREE.MeshStandardMaterial({ color: 0xd8dce6 }),
  );
  body.position.y = h / 2 + 1.2;
  g.add(body);
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(8, 1.2, 0.2),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 }),
  );
  sign.position.set(0, h - 1, 4.2);
  g.add(sign);
  g.position.set(x, 0, z);
  g.userData.shop = label;
  return g;
}

const trafficStates = [];

function addTrafficLights(parent) {
  const crossings = [
    [WORLD_SIZE.eastX, 0, 0],
    [WORLD_SIZE.westX, 0, 0],
    [0, 0, 0],
  ];
  for (const [x, , z] of crossings) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4),
      new THREE.MeshStandardMaterial({ color: 0x333 }),
    );
    pole.position.set(x, 3.2, z);
    parent.add(pole);
    const lights = [
      new THREE.Mesh(new THREE.SphereGeometry(0.25), new THREE.MeshStandardMaterial({ color: 0x330000 })),
      new THREE.Mesh(new THREE.SphereGeometry(0.25), new THREE.MeshStandardMaterial({ color: 0x333300 })),
      new THREE.Mesh(new THREE.SphereGeometry(0.25), new THREE.MeshStandardMaterial({ color: 0x003300 })),
    ];
    lights.forEach((m, i) => {
      m.position.set(x + 0.5, 5.5 - i * 0.6, z);
      parent.add(m);
    });
    trafficStates.push({ lights, phase: 0, t: 0 });
  }
}

export function updateTrafficLights(dt) {
  for (const tl of trafficStates) {
    tl.t += dt;
    if (tl.t > 4) {
      tl.t = 0;
      tl.phase = (tl.phase + 1) % 3;
    }
    const colors = [
      [1, 0.1, 0.1],
      [0.2, 0.2, 0.05],
      [0.1, 0.8, 0.15],
    ];
    tl.lights.forEach((mesh, i) => {
      const on = i === tl.phase;
      const c = colors[i];
      mesh.material.color.setRGB(c[0] * (on ? 1 : 0.15), c[1] * (on ? 1 : 0.15), c[2] * (on ? 1 : 0.15));
      mesh.material.emissive?.setRGB?.(c[0] * (on ? 0.8 : 0), c[1] * (on ? 0.8 : 0), c[2] * (on ? 0.8 : 0));
    });
  }
}

export function createSkyDome(scene) {
  const geo = new THREE.SphereGeometry(400, 32, 16);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(COLORS.skyDayTop) },
      bottomColor: { value: new THREE.Color(COLORS.skyDayBottom) },
      mix: { value: 0 },
    },
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vPos;
      void main() {
        float h = normalize(vPos).y * 0.5 + 0.5;
        gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const sky = new THREE.Mesh(geo, mat);
  scene.add(sky);
  return sky;
}

export function setTimeOfDay(sky, sunLight, hour) {
  const t = hour / 24;
  const day = hour > 6 && hour < 19;
  sky.material.uniforms.mix.value = day ? 0 : 1;
  const top = day ? new THREE.Color(COLORS.skyDayTop) : new THREE.Color(COLORS.skyNightTop);
  const bottom = day ? new THREE.Color(COLORS.skyDayBottom) : new THREE.Color(COLORS.skyNightBottom);
  sky.material.uniforms.topColor.value.copy(top);
  sky.material.uniforms.bottomColor.value.copy(bottom);
  sunLight.intensity = day ? 1.35 : 0.15;
  sunLight.color.setHex(day ? 0xfff0d0 : 0x6688ff);
  return day;
}