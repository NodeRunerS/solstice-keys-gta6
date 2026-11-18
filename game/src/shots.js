/** URL ?shot= flags for reproducible screenshot framing (no network). */
export function applyShotMode(params, ctx) {
  const shot = params.get('shot');
  if (!shot) return null;
  const { player, police, hour, playing, menu } = ctx;
  if (shot === 'menu') {
    menu.show?.();
    return 'menu';
  }
  playing.value = true;
  menu.hide?.();
  if (shot === 'day-drive') {
    hour.value = 16;
    player.mesh.position.set(118, 0, -10);
    player.inVehicle = ctx.mountDemoCar();
    police.stars = 0;
    return shot;
  }
  if (shot === 'night-wanted') {
    hour.value = 21;
    player.mesh.position.set(-120, 0, 12);
    police.heat = 0.85;
    police.stars = 5;
    return shot;
  }
  if (shot === 'mission') {
    hour.value = 17;
    player.mesh.position.set(118, 0, -28);
    ctx.missions.active = { ...ctx.missions.markers[0], startTime: performance.now() / 1000 };
    return shot;
  }
  if (shot === 'cay') {
    hour.value = 18;
    player.mesh.position.set(5, 0, 25);
    return shot;
  }
  return shot;
}