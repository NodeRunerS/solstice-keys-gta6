const KEY = 'solstice-keys-save-v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeSave(state) {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      ...state,
      savedAt: new Date().toISOString(),
    }),
  );
}

export function hasSave() {
  return !!loadSave();
}

export function applySave(player, missions, police) {
  const data = loadSave();
  if (!data) return false;
  player.mesh.position.set(data.x, data.y, data.z);
  player.cash = data.cash ?? player.cash;
  player.health = data.health ?? 100;
  player.armor = data.armor ?? 0;
  player.weapon = data.weapon ?? 1;
  player.ammo = data.ammo ?? player.ammo;
  player.respect = data.respect ?? 0;
  missions.completed = data.missionsCompleted ?? 0;
  police.heat = data.heat ?? 0;
  police.stars = data.stars ?? 0;
  return true;
}

export function snapshotSave(player, missions, police) {
  return {
    x: player.mesh.position.x,
    y: player.mesh.position.y,
    z: player.mesh.position.z,
    cash: player.cash,
    health: player.health,
    armor: player.armor,
    weapon: player.weapon,
    ammo: player.ammo,
    respect: player.respect,
    missionsCompleted: missions.completed,
    heat: police.heat,
    stars: police.stars,
  };
}