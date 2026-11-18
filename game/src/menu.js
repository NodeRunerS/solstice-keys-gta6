import { hasSave } from './save.js';

const menuEl = () => document.getElementById('menu');

export function showMainMenu(onStart, onContinue) {
  menuEl().classList.remove('hidden');
  const canContinue = hasSave();
  menuEl().innerHTML = `
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,#1a0828dd,#0a1628ee)"></div>
    <div style="position:absolute;inset:0;opacity:0.25;background:radial-gradient(circle at 70% 30%,#ff5a9a55,transparent 55%)"></div>
    <div style="position:relative;padding:8vh 6vw;color:#fff;max-width:560px">
      <div style="font-size:clamp(36px,6vw,64px);font-weight:900;letter-spacing:4px;color:#ff9ac8">SOLSTICE</div>
      <div style="font-size:clamp(22px,4vw,38px);font-style:italic;color:#5ffbf1;margin-bottom:1rem">KEYS</div>
      <p style="line-height:1.55;opacity:0.88;margin-bottom:2rem">Rio Calder returns to the islands: Coral Strand neon, Crown Harbor steel, Starfish Cay money — and The Undertow still owns the tide.</p>
      <button id="btn-new" style="display:block;width:100%;padding:14px;margin:8px 0;font-size:16px;border:none;background:linear-gradient(90deg,#ff5a9a,#9b5cff);color:#fff;cursor:pointer;font-weight:700">NEW GAME</button>
      <button id="btn-cont" style="display:block;width:100%;padding:12px;margin:8px 0;font-size:14px;border:1px solid #5ffbf1;background:${canContinue ? '#1a2a44' : 'transparent'};color:${canContinue ? '#fff' : '#888'};cursor:${canContinue ? 'pointer' : 'default'}" ${canContinue ? '' : 'disabled'}>CONTINUE</button>
      <div style="margin-top:1.5rem;font-size:11px;opacity:0.75;line-height:1.7">
        WASD · Shift sprint · F vehicle · E interact/mission · Mouse aim/shoot · 0-4 weapons · R reload · Q/E radio · M radar · V camera
      </div>
    </div>
  `;
  document.getElementById('btn-new').onclick = () => hideMenu(onStart);
  const cont = document.getElementById('btn-cont');
  if (canContinue) cont.onclick = () => hideMenu(() => onContinue());
}

function hideMenu(cb) {
  menuEl().classList.add('hidden');
  menuEl().innerHTML = '';
  cb();
}

export function showPause(onResume) {
  menuEl().classList.remove('hidden');
  menuEl().innerHTML = `
    <div style="position:absolute;inset:0;background:#000a;display:flex;align-items:center;justify-content:center">
      <div style="background:#12182af0;padding:32px;border:2px solid #5ffbf1;color:#fff;text-align:center;min-width:280px">
        <h2 style="margin:0 0 16px;letter-spacing:3px">PAUSED</h2>
        <button id="btn-resume" style="padding:12px 28px;font-size:15px;cursor:pointer;border:none;background:#ff5a9a;color:#fff;font-weight:700">RESUME</button>
      </div>
    </div>
  `;
  document.getElementById('btn-resume').onclick = () => {
    menuEl().classList.add('hidden');
    menuEl().innerHTML = '';
    onResume();
  };
}