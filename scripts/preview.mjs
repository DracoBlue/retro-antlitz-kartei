// Visual smoke test: render a few avatars to PNG using @napi-rs/canvas.
// Shims a minimal `document` so the generator's createCanvas() works in Node.
import { Canvas } from "@napi-rs/canvas";

globalThis.document = {
  createElement(tag) {
    if (tag !== "canvas") throw new Error("only canvas supported in shim");
    return new Canvas(1, 1);
  },
};

const gen = await import("../packages/generator/dist/index.js");
const anim = await import("../packages/animate/dist/index.js");
const { renderAvatar, configFromSeed, randomConfig, createRng, normalizeConfig, encodeConfig, DEFAULT_CONFIG } = gen;
const { drawArenaFrame } = anim;
const fs = await import("node:fs");

function save(name, canvas) {
  fs.writeFileSync(`/tmp/rak-out/${name}.png`, canvas.toBuffer("image/png"));
}

// Grid of seeded avatars in three views
const seeds = ["Ada", "Bjarne", "Carol", "Dijkstra", "Eve", "Frank"];
const cell = 200;
const cols = 3;
const rows = Math.ceil(seeds.length / cols);
const sheet = new Canvas(cols * cell, rows * cell);
const sctx = sheet.getContext("2d");
sctx.fillStyle = "#222";
sctx.fillRect(0, 0, sheet.width, sheet.height);
seeds.forEach((seed, i) => {
  const cfg = configFromSeed(seed);
  const c = new Canvas(cell, cell);
  renderAvatar(c, cfg);
  sctx.drawImage(c, (i % cols) * cell, Math.floor(i / cols) * cell);
});
save("seed-grid", sheet);

// One avatar in all three views
const cfg = normalizeConfig({ hut: 1, haare: 2, ohren: 1, nase: 1, mund: 3, torso: 0, hose: 1, skin: 2, cloth: 2, bg: 4, gender: 2, acc: 5 });
const views = ["left", "front", "right"];
const vSheet = new Canvas(views.length * 200, 250);
const vctx = vSheet.getContext("2d");
views.forEach((view, i) => {
  const c = new Canvas(200, 250);
  renderAvatar(c, { ...cfg, view });
  vctx.drawImage(c, i * 200, 0);
});
save("views", vSheet);
console.log("default code:", encodeConfig(DEFAULT_CONFIG));
console.log("Ada code:", encodeConfig(configFromSeed("Ada")));

// Combat poses static frames
const poses = ["idle", "walk", "attack", "block", "hurt", "win"];
const sprite = gen.composeSprite({ ...cfg, view: "right" }, "right");
const pSheet = new Canvas(poses.length * 180, 200);
const pctx = pSheet.getContext("2d");
poses.forEach((pose, i) => {
  const c = new Canvas(180, 200);
  const ctx = c.getContext("2d");
  drawArenaFrame(ctx, 180, 200, sprite, pose, 0.3);
  pctx.drawImage(c, i * 180, 0);
});
save("poses", pSheet);

console.log("rendered: seed-grid, views, poses ->", "/tmp/rak-out");
