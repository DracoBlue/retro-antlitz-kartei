// Generate the showcase PNGs embedded in the README. Run after `pnpm build`:
//   node scripts/gen-readme-images.mjs
import { Canvas } from "@napi-rs/canvas";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

globalThis.document = {
  createElement(tag) {
    if (tag !== "canvas") throw new Error("only canvas supported");
    return new Canvas(1, 1);
  },
};

const gen = await import("../packages/generator/dist/index.js");
const anim = await import("../packages/animate/dist/index.js");
const { renderAvatar, composeSprite, configFromSeed, normalizeConfig } = gen;
const { drawArenaFrame, POSES, POSE_NAMES } = anim;

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(outDir, { recursive: true });
const save = (name, canvas) => writeFileSync(join(outDir, name), canvas.toBuffer("image/png"));

// 1) Seed gallery — 8 deterministic avatars in a row.
{
  const seeds = ["Ada", "Bjarne", "Carol", "Dennis", "Edsger", "Frances", "Grace", "Linus"];
  const cell = 150;
  const sheet = new Canvas(seeds.length * cell, cell);
  const ctx = sheet.getContext("2d");
  seeds.forEach((seed, i) => {
    const c = new Canvas(cell, cell);
    renderAvatar(c, configFromSeed(seed));
    ctx.drawImage(c, i * cell, 0);
  });
  save("seeds.png", sheet);
}

// 2) Three views of one avatar.
{
  const cfg = normalizeConfig({ hat: "top-hat", hair: "tousled", ears: "sail-ears", nose: "aquiline", mouth: "grin", top: "suit", trousers: "jeans", skin: "#e0ac69", topColor: "#3a86ff", background: "#8338ec", build: "large", accessory: "full-beard" });
  const cell = 200;
  const sheet = new Canvas(3 * cell, cell + 20);
  const ctx = sheet.getContext("2d");
  ["left", "front", "right"].forEach((view, i) => {
    const c = new Canvas(cell, cell + 20);
    renderAvatar(c, { ...cfg, view });
    ctx.drawImage(c, i * cell, 0);
  });
  save("views.png", sheet);
}

// 3) Combat poses — natural 360x380 arena, tiled 3x2 with labels.
{
  const cfg = normalizeConfig({ hat: "none", hair: "mohawk", nose: "button", mouth: "snarl", top: "leather-jacket", trousers: "bell-bottoms", skin: "#c68642", topColor: "#9b5de5", background: "#8338ec", build: "large", accessory: "moustache" });
  const sprite = composeSprite({ ...cfg, view: "right" }, "right");
  const cw = 300;
  const ch = 320;
  const cols = 3;
  const rows = Math.ceil(POSES.length / cols);
  const sheet = new Canvas(cols * cw, rows * ch);
  const sctx = sheet.getContext("2d");
  POSES.forEach((pose, i) => {
    const c = new Canvas(cw, ch);
    const ctx = c.getContext("2d");
    drawArenaFrame(ctx, cw, ch, sprite, pose, 0.3, { scale: 6 });
    ctx.fillStyle = "#ffe600";
    ctx.font = "16px monospace";
    ctx.fillText(POSE_NAMES[pose].toUpperCase(), 12, 26);
    sctx.drawImage(c, (i % cols) * cw, Math.floor(i / cols) * ch);
  });
  save("poses.png", sheet);
}

console.log("wrote assets/seeds.png, assets/views.png, assets/poses.png");
