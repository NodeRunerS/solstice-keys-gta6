import { RADIO } from './config.js';

const hudEl = () => document.getElementById('hud');

export function initHud() {
  hudEl().innerHTML = `
    <div id="hud-top" style="position:absolute;top:14px;right:18px;text-align:right;color:#fff;text-shadow:0 0 8px #ff5a9a">
      <div id="hud-clock" style="font-size:14px;letter-spacing:2px;opacity:0.9"></div>
      <div id="hud-cash" style="font-size:28px;color:#5ffbf1;font-weight:700"></div>
      <div id="hud-stars" style="font-size:22px;margin:6px 0;color:#ffe566"></div>
      <div id="hud-weapon" style="font-size:13px;opacity:0.9"></div>
      <div id="hud-radio" style="font-size:11px;opacity:0.8;margin-top:4px;color:#ff9ac8"></div>
    </div>
    <div id="hud-bars" style="position:absolute;top:14px;left:50%;transform:translateX(-50%);width:200px">
      <div style="height:10px;background:#1a1a22;border:1px solid #444;margin-bottom:4px"><div id="hp" style="height:100%;width:100%;background:linear-gradient(90deg,#2ecc71,#27ae60)"></div></div>
      <div style="height:8px;background:#1a1a22;border:1px solid #444"><div id="armor" style="height:100%;width:0%;background:linear-gradient(90deg,#3498db,#2980b9)"></div></div>
      <div id="respect" style="font-size:10px;text-align:center;margin-top:4px;color:#ccc"></div>
    </div>
    <div id="radar-wrap" style="position:absolute;bottom:18px;left:18px;width:156px;height:156px;border-radius:50%;overflow:hidden;border:3px solid #ff5a9a;box-shadow:0 0 22px #5ffbf160">
      <canvas id="radar" width="156" height="156" style="background:#0a1628"></canvas>
    </div>
    <div id="mission" style="position:absolute;bottom:22px;left:50%;transform:translateX(-50%);color:#fff;background:#0009;padding:10px 16px;border-left:4px solid #ff3dd4;font-size:13px;max-width:460px"></div>
    <div id="toast" style="position:absolute;top:80px;left:50%;transform:translateX(-50%);color:#fff;background:#000b;padding:8px 14px;font-size:12px;display:none"></div>
    <div id="hint" style="position:absolute;bottom:190px;left:18px;color:#ddd;font-size:12px;opacity:0.85;max-width:320px"></div>
  `;
}

let toastTimer = 0;

export function showToast(msg, duration = 2.8) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  toastTimer = duration;
}

export function updateHud(state) {
  const { player, police, mission, gameTime, weaponName, ammoText, radioIndex, district } = state;
  document.getElementById('hud-clock').textContent = `DAY 1 ${gameTime}`;
  document.getElementById('hud-cash').textContent = `$${Math.floor(player.cash).toLocaleString()}`;
  const stars = '★'.repeat(police.stars) + '☆'.repeat(6 - police.stars);
  document.getElementById('hud-stars').textContent = stars;
  document.getElementById('hud-weapon').textContent = `${weaponName}  ${ammoText}`;
  const r = RADIO[radioIndex];
  document.getElementById('hud-radio').textContent = r ? `▶ ${r.name}` : '';
  document.getElementById('hp').style.width = `${Math.max(0, player.health)}%`;
  document.getElementById('armor').style.width = `${player.armor}%`;
  document.getElementById('respect').textContent = `RESPECT · ${player.respect}`;
  const m = document.getElementById('mission');
  if (mission?.objective) m.textContent = `▶ ${mission.objective}`;
  else if (mission?.done) m.textContent = `✓ ${mission.title} complete`;
  else m.textContent = state.missionIdle ?? '';
  const hint = document.getElementById('hint');
  if (hint) hint.textContent = state.hint ?? district ?? '';
  if (toastTimer > 0) {
    toastTimer -= state.dt ?? 0.016;
    if (toastTimer <= 0) document.getElementById('toast').style.display = 'none';
  }
  drawRadar(state);
}

function drawRadar(state) {
  const canvas = document.getElementById('radar');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#1e3a5f';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, (i + 1) * 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#345';
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  const p = state.player.mesh.position;
  const scale = 0.32;
  const yaw = state.playerYaw ?? 0;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-yaw);
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(-5, 6);
  ctx.lineTo(5, 6);
  ctx.fill();
  ctx.restore();
  for (const car of state.traffic ?? []) {
    plotBlip(ctx, w, h, p, car.mesh.position, scale, '#8af', 3);
  }
  if (state.missionTarget) plotBlip(ctx, w, h, p, state.missionTarget, scale, '#ff3dd4', 4);
  for (const cop of state.police.units ?? []) {
    plotBlip(ctx, w, h, p, cop.mesh.position, scale, '#f55', 3);
  }
  for (const heli of state.police.helis ?? []) {
    plotBlip(ctx, w, h, p, heli.mesh.position, scale, '#f90', 4);
  }
}

function plotBlip(ctx, w, h, p, target, scale, color, size) {
  const dx = (target.x - p.x) * scale;
  const dz = (target.z - p.z) * scale;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(w / 2 + dx, h / 2 + dz, size, 0, Math.PI * 2);
  ctx.fill();
}