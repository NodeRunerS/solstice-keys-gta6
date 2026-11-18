const keys = new Set();
let pointerLocked = false;
let mouseDX = 0;
let mouseDY = 0;

export function bindInput(canvas) {
  window.addEventListener('keydown', (e) => {
    if (['1', '2', '3', '4', '0'].includes(e.key)) e.preventDefault();
    keys.add(e.key.toLowerCase());
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  canvas.addEventListener('click', () => {
    if (!pointerLocked && document.pointerLockElement !== canvas) {
      canvas.requestPointerLock?.();
    }
  });
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === canvas;
  });
  document.addEventListener('mousemove', (e) => {
    if (pointerLocked) {
      mouseDX += e.movementX;
      mouseDY += e.movementY;
    }
  });
}

export function consumeMouse() {
  const dx = mouseDX;
  const dy = mouseDY;
  mouseDX = 0;
  mouseDY = 0;
  return { dx, dy };
}

export const down = (k) => keys.has(k);
export const any = (...list) => list.some((k) => keys.has(k));