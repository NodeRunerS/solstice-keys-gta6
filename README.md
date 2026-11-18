# Solstice Keys

make.fun · **gta6-01** — open-world crime game in the browser (original IP, Vice-era atmosphere).

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)

**Solstice Keys** is a 3D WebGL open world: Coral Strand, Crown Harbor, Starfish Cay, vehicles, wanted level, missions, shops, boat and helicopter, offline static files.

## Run it

```sh
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
node serve.ts
```

Open http://localhost:8080 — **NEW GAME**, click canvas for mouse aim.

Hand-in check:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Controls

WASD move/drive · Shift sprint · Space jump/drift · F vehicle · E interact/mission · Mouse shoot · 0–4 weapons · R reload · Q/E radio · V camera · Esc pause

## Stack

Three.js (`game/vendor/`), ES modules, Web Audio synth, `localStorage` saves. Entry: `main.ts` (Node 22).