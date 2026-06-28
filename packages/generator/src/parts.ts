import type { Ctx2D } from "./types.js";
import type { PartId } from "./palettes.js";
import { shade } from "./color.js";
import { HAIR } from "./palettes.js";

/** Part ids the profile view needs, taken straight from the config. */
export interface SideParts {
  hat: PartId<"hat">;
  hair: PartId<"hair">;
  nose: PartId<"nose">;
  mouth: PartId<"mouth">;
  accessory: PartId<"accessory">;
  top: PartId<"top">;
  trousers: PartId<"trousers">;
  shoes: PartId<"shoes">;
}

/** Accessory ids that render as eyewear. */
export type GlassesId = "nerd-glasses" | "round-glasses" | "sunglasses" | "monocle";
/** Accessory ids that render as facial hair. */
export type BeardId = "full-beard" | "moustache" | "goatee";

/** The sprite grid the figure is composed on: 32 columns × 40 rows. */
export const COLS = 32;
export const ROWS = 40;

/* ---------- low-level pixel ops on a 2D context ---------- */

/** Fill an axis-aligned rectangle of pixels. */
export function P(g: Ctx2D, x: number, y: number, w: number, h: number, c: string): void {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}

/** Set a single pixel. */
export function px(g: Ctx2D, x: number, y: number, c: string): void {
  g.fillStyle = c;
  g.fillRect(x, y, 1, 1);
}

/** Clear a single pixel back to transparent. */
export function clr(g: Ctx2D, x: number, y: number): void {
  g.clearRect(x, y, 1, 1);
}

/* ---------- figure parts (front view, 32×40 grid) ----------
   Every part switches on its string id, so options can be added or reordered
   without renumbering anything. */

export function drawTrousers(g: Ctx2D, id: PartId<"trousers">, color: string, skin: string): void {
  const PC = color;
  const d = shade(PC, -0.28);
  const hi = shade(PC, 0.18);
  // hips
  P(g, 9, 33, 14, 2, PC);
  if (id === "shorts") {
    // short legs, skin below
    P(g, 9, 35, 5, 3, PC);
    P(g, 18, 35, 5, 3, PC);
    P(g, 9, 38, 5, 2, skin);
    P(g, 18, 38, 5, 2, skin);
    P(g, 8, 39, 6, 1, shade(skin, -0.25));
    P(g, 18, 39, 6, 1, shade(skin, -0.25));
  } else if (id === "bell-bottoms") {
    // flare at bottom
    P(g, 9, 35, 5, 3, PC);
    P(g, 18, 35, 5, 3, PC);
    P(g, 8, 38, 6, 2, PC);
    P(g, 17, 38, 6, 2, PC);
    P(g, 8, 39, 6, 1, d);
    P(g, 17, 39, 6, 1, d);
  } else {
    P(g, 9, 35, 5, 5, PC);
    P(g, 18, 35, 5, 5, PC);
    P(g, 13, 35, 1, 5, d);
    P(g, 18, 35, 1, 5, d); // leg seams
  }
  P(g, 9, 33, 14, 1, hi); // belt highlight
  if (id === "suit-trousers") {
    P(g, 9, 33, 14, 1, "#1c2740");
    px(g, 15, 33, "#d9b34a"); // dark belt + buckle
  }
  if (id === "cargo") {
    P(g, 10, 36, 2, 1, d);
    P(g, 19, 36, 2, 1, d); // pockets
  }
  if (id === "lederhosen") {
    P(g, 14, 33, 1, 4, shade(PC, -0.4));
    P(g, 17, 33, 1, 4, shade(PC, -0.4)); // straps
  }
  if (id === "plaid") {
    for (let yy = 35; yy < 40; yy++)
      for (let xx = 9; xx < 23; xx++) {
        if (xx >= 14 && xx < 18) continue;
        if ((xx + yy) & 1) px(g, xx, yy, d);
      }
  }
}

export function drawTop(g: Ctx2D, id: PartId<"top">, cloth: string, skin: string): void {
  const d = shade(cloth, -0.26);
  const hi = shade(cloth, 0.2);
  // arms (sleeves)
  P(g, 5, 25, 2, 7, cloth);
  P(g, 25, 25, 2, 7, cloth);
  P(g, 5, 25, 1, 7, d);
  P(g, 26, 25, 1, 7, d);
  // hands
  P(g, 5, 32, 2, 1, skin);
  P(g, 25, 32, 2, 1, skin);
  // body
  P(g, 7, 24, 18, 9, cloth);
  P(g, 7, 24, 18, 1, hi);
  P(g, 23, 25, 1, 8, d);
  // shoulders round
  clr(g, 7, 24);
  clr(g, 24, 24);
  switch (id) {
    case "suit":
      P(g, 7, 24, 18, 9, "#2c3144");
      P(g, 13, 24, 6, 9, "#f4f4f4"); // shirt
      P(g, 15, 25, 2, 6, "#c01622"); // tie
      P(g, 11, 24, 2, 5, "#2c3144");
      P(g, 19, 24, 2, 5, "#2c3144"); // lapels
      px(g, 14, 30, "#d9d9d9");
      break;
    case "shirt":
      P(g, 14, 24, 4, 4, shade(cloth, 0.3));
      px(g, 15, 27, d);
      px(g, 15, 30, d);
      break;
    case "uniform":
      P(g, 7, 24, 3, 2, "#d9b34a");
      P(g, 22, 24, 3, 2, "#d9b34a"); // epaulettes
      P(g, 15, 25, 1, 7, d); // placket
      px(g, 15, 26, "#ffe08a");
      px(g, 15, 28, "#ffe08a");
      px(g, 15, 30, "#ffe08a");
      P(g, 9, 26, 2, 2, "#c0392b"); // medal
      break;
    case "sweater":
      P(g, 7, 31, 18, 2, d); // hem
      P(g, 13, 24, 6, 2, d); // collar
      break;
    case "hawaiian":
      for (let yy = 25; yy < 32; yy += 2) for (let xx = 8; xx < 24; xx += 3) px(g, xx, yy, "#ffe08a");
      for (let yy = 26; yy < 32; yy += 2) for (let xx = 10; xx < 24; xx += 3) px(g, xx, yy, "#ff5d8f");
      P(g, 13, 24, 6, 3, shade(cloth, 0.35));
      break;
    case "robe":
      P(g, 7, 24, 18, 9, "#1c1c22");
      P(g, 14, 24, 4, 9, "#33333d");
      P(g, 13, 24, 6, 2, "#5a5a66");
      break;
    case "hi-vis-vest":
      P(g, 7, 24, 18, 9, "#ff7a00");
      P(g, 9, 26, 14, 1, "#e8e8e8");
      P(g, 9, 29, 14, 1, "#e8e8e8");
      P(g, 13, 24, 6, 9, "#3a3a3a");
      break;
    case "leather-jacket":
      P(g, 7, 24, 18, 9, "#2a2a30");
      P(g, 15, 24, 1, 9, "#6a6a72"); // zipper
      P(g, 11, 25, 1, 6, "#6a6a72");
      P(g, 19, 25, 1, 6, "#6a6a72");
      break;
  }
}

export function drawHead(g: Ctx2D, skin: string): void {
  const d = shade(skin, -0.22);
  const hi = shade(skin, 0.16);
  P(g, 14, 21, 4, 3, d); // neck
  P(g, 9, 8, 14, 14, skin); // head
  P(g, 21, 9, 1, 12, d); // right shade
  P(g, 10, 20, 12, 1, d); // chin shade
  P(g, 10, 9, 2, 1, hi); // forehead highlight
  // round corners
  clr(g, 9, 8);
  clr(g, 22, 8);
  clr(g, 9, 21);
  clr(g, 22, 21);
  clr(g, 9, 9);
  clr(g, 22, 9);
  clr(g, 9, 20);
  clr(g, 22, 20);
}

export function drawEars(g: Ctx2D, id: PartId<"ears">, skin: string): void {
  const d = shade(skin, -0.28);
  const E = (x: number, y: number, w: number, h: number) => {
    P(g, x, y, w, h, skin);
  };
  switch (id) {
    case "normal":
      E(7, 13, 2, 3);
      E(23, 13, 2, 3);
      break;
    case "sail-ears":
      E(7, 11, 3, 5);
      E(22, 11, 3, 5);
      break;
    case "pointed":
      E(8, 12, 2, 2);
      px(g, 8, 11, skin);
      px(g, 9, 11, skin);
      E(22, 12, 2, 2);
      px(g, 22, 11, skin);
      px(g, 23, 11, skin);
      break;
    case "small":
      E(9, 13, 1, 2);
      E(22, 13, 1, 2);
      break;
    case "sticking-out":
      E(7, 12, 3, 3);
      E(22, 12, 3, 3);
      break;
    case "floppy":
      E(8, 13, 2, 4);
      E(22, 13, 2, 4);
      break;
    case "elf":
      px(g, 9, 13, skin);
      px(g, 8, 11, skin);
      px(g, 8, 12, skin);
      px(g, 22, 13, skin);
      px(g, 23, 11, skin);
      px(g, 23, 12, skin);
      break;
    case "huge":
      E(6, 10, 4, 6);
      E(22, 10, 4, 6);
      break;
  }
  px(g, 8, 14, d);
  px(g, 23, 14, d);
}

export function drawNose(g: Ctx2D, id: PartId<"nose">, skin: string): void {
  const d = shade(skin, -0.3);
  const dd = shade(skin, -0.45);
  switch (id) {
    case "button":
      P(g, 15, 16, 2, 2, d);
      break;
    case "aquiline":
      P(g, 15, 15, 2, 4, skin);
      P(g, 15, 18, 2, 1, d);
      px(g, 16, 15, dd);
      break;
    case "bulbous":
      P(g, 14, 17, 4, 2, skin);
      P(g, 14, 18, 4, 1, d);
      px(g, 15, 17, shade(skin, 0.1));
      break;
    case "pointed":
      P(g, 15, 15, 1, 4, d);
      px(g, 15, 18, dd);
      break;
    case "wide":
      P(g, 14, 17, 4, 2, d);
      break;
    case "hooked":
      P(g, 15, 15, 2, 2, skin);
      px(g, 15, 17, d);
      px(g, 14, 18, d);
      break;
    case "snub":
      P(g, 15, 17, 2, 1, d);
      px(g, 15, 16, skin);
      break;
    case "clown":
      P(g, 14, 16, 4, 3, "#e63946");
      px(g, 15, 17, "#ff8080");
      clr(g, 14, 16);
      clr(g, 17, 16);
      break;
  }
}

export function drawMouth(g: Ctx2D, id: PartId<"mouth">): void {
  const m = "#7a2e22";
  const t = "#fff";
  switch (id) {
    case "smile":
      P(g, 13, 19, 6, 1, m);
      px(g, 12, 18, m);
      px(g, 19, 18, m);
      break;
    case "grimace":
      P(g, 13, 19, 6, 1, m);
      px(g, 13, 18, m);
      px(g, 18, 20, m);
      break;
    case "pout":
      P(g, 14, 18, 4, 2, m);
      px(g, 15, 19, "#b5544a");
      break;
    case "grin":
      P(g, 12, 18, 8, 2, m);
      P(g, 13, 19, 6, 1, t); // teeth
      break;
    case "scream":
      P(g, 14, 18, 4, 3, "#3a0f0a");
      P(g, 15, 19, 2, 1, "#b5544a");
      break;
    case "line":
      P(g, 13, 19, 6, 1, m);
      break;
    case "snarl":
      P(g, 12, 18, 8, 2, t);
      for (let x = 12; x < 20; x += 2) px(g, x, 18, m);
      P(g, 12, 20, 8, 1, m);
      break;
    case "whistle":
      P(g, 13, 19, 4, 1, m);
      P(g, 17, 18, 2, 3, "#5a3a2a");
      P(g, 18, 17, 2, 1, "#caa");
      break;
  }
}

export function drawBeard(g: Ctx2D, id: BeardId): void {
  const h = HAIR;
  const hd = shade(h, -0.2);
  if (id === "moustache") {
    P(g, 12, 18, 7, 1, h);
    px(g, 12, 17, h);
    px(g, 18, 17, h);
    return;
  }
  if (id === "goatee") {
    P(g, 12, 18, 7, 1, h); // moustache
    P(g, 14, 21, 4, 1, h);
    P(g, 15, 20, 2, 1, h); // chin patch
    return;
  }
  // full-beard
  P(g, 10, 18, 12, 4, h);
  clr(g, 14, 19);
  clr(g, 15, 19);
  clr(g, 16, 19);
  clr(g, 17, 19); // mouth gap
  clr(g, 14, 20);
  clr(g, 17, 20);
  P(g, 8, 16, 1, 5, h);
  P(g, 23, 16, 1, 5, h); // sideburns
  P(g, 13, 21, 6, 1, hd); // chin shade
}

export function drawHair(g: Ctx2D, id: PartId<"hair">): void {
  if (id === "bald") return;
  const h = HAIR;
  const hd = shade(h, -0.22);
  const hh = shade(h, 0.18);
  switch (id) {
    case "side-part":
      P(g, 10, 6, 12, 3, h);
      P(g, 9, 7, 1, 5, h);
      P(g, 22, 7, 1, 4, h);
      P(g, 10, 6, 12, 1, hh);
      P(g, 15, 7, 1, 2, hd);
      break;
    case "tousled":
      P(g, 9, 5, 14, 4, h);
      P(g, 8, 7, 1, 4, h);
      P(g, 23, 7, 1, 4, h);
      px(g, 9, 4, h);
      px(g, 12, 4, h);
      px(g, 15, 4, h);
      px(g, 18, 4, h);
      px(g, 21, 4, h);
      P(g, 9, 5, 14, 1, hh);
      break;
    case "mullet":
      P(g, 10, 6, 12, 2, h);
      P(g, 9, 6, 1, 3, h);
      P(g, 22, 6, 1, 3, h);
      P(g, 9, 18, 2, 5, h);
      P(g, 21, 18, 2, 5, h); // long back
      P(g, 10, 6, 12, 1, hh);
      break;
    case "blow-wave": // toupee
      P(g, 9, 4, 14, 4, "#d9a441");
      P(g, 8, 6, 2, 3, "#d9a441");
      P(g, 22, 6, 2, 3, "#d9a441");
      P(g, 9, 4, 14, 1, "#f0c870");
      P(g, 9, 7, 14, 1, shade("#d9a441", -0.2));
      break;
    case "mohawk":
      P(g, 15, 3, 2, 6, "#e63946");
      P(g, 14, 4, 1, 4, "#e63946");
      P(g, 17, 4, 1, 4, "#e63946");
      P(g, 15, 3, 2, 1, "#ff8a93");
      break;
    case "bun":
      P(g, 10, 7, 12, 2, h);
      P(g, 9, 7, 1, 3, h);
      P(g, 22, 7, 1, 3, h);
      P(g, 14, 3, 4, 3, h);
      P(g, 14, 3, 4, 1, hh);
      break;
    case "messy":
      P(g, 9, 5, 14, 3, h);
      px(g, 8, 5, h);
      px(g, 10, 3, h);
      px(g, 13, 4, h);
      px(g, 16, 3, h);
      px(g, 19, 4, h);
      px(g, 23, 5, h);
      P(g, 8, 7, 1, 3, h);
      P(g, 23, 7, 1, 3, h);
      break;
  }
}

export function drawHat(g: Ctx2D, id: PartId<"hat">, cloth: string): void {
  switch (id) {
    case "none":
      return;
    case "top-hat":
      P(g, 8, 7, 16, 1, "#15151a");
      P(g, 11, 1, 10, 6, "#1c1c24");
      P(g, 11, 3, 10, 1, "#c01622");
      P(g, 11, 1, 10, 1, "#33333d");
      break;
    case "crown":
      P(g, 10, 4, 12, 3, "#f2c200");
      P(g, 10, 4, 12, 1, "#fff0a0");
      px(g, 10, 2, "#f2c200");
      px(g, 13, 2, "#f2c200");
      px(g, 16, 2, "#f2c200");
      px(g, 19, 2, "#f2c200");
      px(g, 21, 2, "#f2c200");
      px(g, 12, 2, "#e63946");
      px(g, 16, 2, "#3a86ff");
      px(g, 20, 2, "#06d6a0");
      break;
    case "hard-hat":
      P(g, 9, 6, 14, 1, "#e6a700");
      P(g, 11, 2, 10, 4, "#ffc400");
      P(g, 15, 2, 2, 4, "#e6a700");
      P(g, 11, 2, 10, 1, "#ffe08a");
      break;
    case "peaked-cap":
      P(g, 10, 4, 12, 3, cloth);
      P(g, 8, 6, 8, 1, shade(cloth, -0.3)); // brim
      P(g, 10, 4, 12, 1, shade(cloth, 0.2));
      P(g, 14, 5, 4, 1, "#fff");
      break;
    case "tyrolean-hat":
      P(g, 8, 6, 16, 1, "#3a5a2a");
      P(g, 11, 2, 10, 4, "#4a6a33");
      P(g, 11, 2, 10, 1, "#6a8a4a");
      P(g, 12, 3, 1, 3, "#fff");
      P(g, 13, 2, 1, 2, "#c01622");
      break;
    case "pickelhaube":
      P(g, 10, 4, 12, 3, "#2a2a30");
      P(g, 9, 6, 14, 1, "#d9b34a");
      P(g, 15, 1, 2, 3, "#d9b34a");
      P(g, 15, 0, 2, 1, "#d9b34a");
      break;
    case "halo":
      P(g, 10, 2, 12, 1, "#fff7c0");
      P(g, 9, 3, 1, 1, "#fff7c0");
      P(g, 22, 3, 1, 1, "#fff7c0");
      P(g, 11, 2, 10, 1, "#ffe066");
      break;
  }
}

export function drawGlasses(g: Ctx2D, id: GlassesId): void {
  const f = "#1c1c22";
  const l = "rgba(180,220,255,0.6)";
  const ring = (x0: number) => {
    P(g, x0, 12, 4, 1, f);
    P(g, x0, 15, 4, 1, f);
    px(g, x0, 13, f);
    px(g, x0, 14, f);
    px(g, x0 + 3, 13, f);
    px(g, x0 + 3, 14, f);
  };
  if (id === "sunglasses") {
    P(g, 10, 12, 4, 4, f);
    P(g, 18, 12, 4, 4, f);
    px(g, 11, 13, "#3a5a7a");
    px(g, 19, 13, "#3a5a7a");
    P(g, 14, 12, 4, 1, f);
    px(g, 9, 13, f);
    px(g, 22, 13, f);
    return;
  }
  if (id === "monocle") {
    ring(18);
    P(g, 19, 13, 2, 1, l);
    px(g, 21, 16, "#d9b34a");
    px(g, 21, 18, "#d9b34a");
    px(g, 20, 17, "#d9b34a");
    return;
  }
  ring(10);
  ring(18);
  if (id === "round-glasses") {
    clr(g, 10, 12);
    clr(g, 13, 12);
    clr(g, 10, 15);
    clr(g, 13, 15);
    clr(g, 18, 12);
    clr(g, 21, 12);
    clr(g, 18, 15);
    clr(g, 21, 15);
  }
  P(g, 14, 13, 4, 1, f); // bridge
  px(g, 9, 13, f);
  px(g, 22, 13, f); // temples
  P(g, 11, 13, 2, 1, l);
  P(g, 19, 13, 2, 1, l); // glint
}

/* ---------- shoes (drawn over the bottom of the legs) ---------- */

export function drawShoes(g: Ctx2D, id: PartId<"shoes">, skin: string): void {
  if (id === "none") {
    // barefoot — skin toes peeking out at the bottom of each leg
    const d = shade(skin, -0.25);
    P(g, 9, 39, 5, 1, skin);
    P(g, 18, 39, 5, 1, skin);
    px(g, 12, 39, d);
    px(g, 21, 39, d);
    return;
  }
  shoeFront(g, 9, id, -1, skin); // left foot (leg x9–13)
  shoeFront(g, 18, id, 1, skin); // right foot (leg x18–22)
}

function shoeFront(g: Ctx2D, x: number, id: PartId<"shoes">, side: number, skin: string): void {
  switch (id) {
    case "sneakers":
      P(g, x, 38, 5, 1, "#eef0f4");
      P(g, x, 39, 5, 1, "#3a86ff");
      px(g, x + 2, 38, "#c9ccd6");
      break;
    case "boots":
      P(g, x, 37, 5, 3, "#5a3a1a");
      P(g, x, 37, 5, 1, "#6b4a2a");
      P(g, x, 39, 5, 1, "#2a1a0a");
      break;
    case "dress-shoes":
      P(g, x, 38, 5, 2, "#1c1c22");
      px(g, x + 1, 38, "#3a3a44");
      break;
    case "sandals":
      P(g, x, 38, 5, 2, skin);
      P(g, x, 39, 5, 1, "#5a3a2a");
      px(g, x + 1, 38, "#5a3a2a");
      px(g, x + 3, 38, "#5a3a2a");
      break;
    case "heels":
      P(g, x, 38, 5, 2, "#c01622");
      px(g, x + 2, 38, "#ff6b78");
      px(g, side < 0 ? x : x + 4, 39, "#7a0e16");
      break;
    case "rubber-boots":
      P(g, x, 37, 5, 3, "#ffd166");
      P(g, x, 37, 5, 1, "#ffe09a");
      break;
    case "clown-shoes": {
      const x0 = side < 0 ? x - 2 : x;
      P(g, x0, 38, 7, 2, "#e63946");
      P(g, x0, 39, 7, 1, "#b51e2b");
      px(g, side < 0 ? x0 : x0 + 6, 38, "#ff8a93");
      break;
    }
  }
}

const SIDE_SHOE_COLOR: Record<PartId<"shoes">, string> = {
  sneakers: "#eef0f4",
  boots: "#5a3a1a",
  "dress-shoes": "#1c1c22",
  sandals: "#7a5a3a",
  heels: "#c01622",
  "rubber-boots": "#ffd166",
  "clown-shoes": "#e63946",
  none: "#000000",
};

/** Shoes for the profile view (figure faces right; toe points +x). */
export function drawShoesSide(g: Ctx2D, id: PartId<"shoes">, skin: string): void {
  if (id === "none") {
    // barefoot — skin feet
    P(g, 11, 39, 5, 1, shade(skin, -0.2)); // back foot
    P(g, 15, 39, 6, 1, skin); // front foot + toes
    return;
  }
  const c = SIDE_SHOE_COLOR[id];
  const c2 = shade(c, -0.28);
  if (id === "clown-shoes") {
    P(g, 11, 39, 5, 1, c2);
    P(g, 15, 39, 9, 1, c); // long toe to x23
    px(g, 23, 39, "#ff8a93");
    return;
  }
  P(g, 11, 39, 5, 1, c2); // back foot
  P(g, 15, 39, 6, 1, c); // front foot + toe
  if (id === "boots" || id === "rubber-boots") {
    P(g, 15, 38, 4, 1, c);
    P(g, 12, 38, 3, 1, c2);
  }
  if (id === "dress-shoes") px(g, 19, 39, shade(c, 0.6));
  if (id === "sandals") {
    px(g, 16, 39, "#3a2a1a");
    px(g, 18, 39, "#3a2a1a");
  }
}

/* ---------- side / profile view (faces right; mirrored for left) ---------- */

export function drawSide(g: Ctx2D, s: SideParts, skin: string, cloth: string, pants: string, gx: "m" | "w" | "n"): void {
  const sd = shade(skin, -0.22);
  const h = HAIR;
  // legs
  const PC = pants;
  P(g, 11, 33, 5, 7, shade(PC, -0.2)); // back leg
  P(g, 15, 33, 5, 7, PC); // front leg
  P(g, 11, 33, 9, 2, shade(PC, 0.15)); // hip/belt
  drawShoesSide(g, s.shoes, skin);
  // torso
  const suit = s.top === "suit";
  const tcol =
    s.top === "suit"
      ? "#2c3144"
      : s.top === "robe"
        ? "#1c1c22"
        : s.top === "hi-vis-vest"
          ? "#ff7a00"
          : s.top === "leather-jacket"
            ? "#2a2a30"
            : cloth;
  P(g, 9, 24, 12, 9, tcol);
  P(g, 9, 24, 12, 1, shade(tcol, 0.2));
  P(g, 8, 25, 1, 8, shade(tcol, -0.3)); // back
  P(g, 20, 26, 1, 6, shade(tcol, -0.15)); // chest front
  P(g, 17, 25, 3, 7, shade(tcol, -0.08)); // front arm
  P(g, 17, 32, 3, 1, skin); // hand
  if (suit) {
    P(g, 15, 24, 3, 6, "#f4f4f4");
    P(g, 16, 25, 1, 5, "#c01622");
  }
  if (s.top === "hi-vis-vest") {
    P(g, 9, 27, 12, 1, "#e8e8e8");
    P(g, 9, 30, 12, 1, "#e8e8e8");
  }
  // neck
  P(g, 12, 21, 5, 3, sd);
  // head (facing right)
  P(g, 8, 8, 13, 14, skin);
  clr(g, 8, 8);
  clr(g, 9, 8);
  clr(g, 8, 9);
  clr(g, 8, 21);
  P(g, 8, 9, 1, 11, sd); // back shade
  P(g, 20, 11, 1, 4, skin); // face front
  // ear (back)
  P(g, 11, 14, 2, 3, skin);
  px(g, 12, 15, sd);
  // eye + brow
  P(g, 16, 13, 2, 2, "#fff");
  px(g, 17, 14, "#26324a");
  P(g, 15, 12, 3, 1, h);
  // nose by variant
  switch (s.nose) {
    case "aquiline":
      P(g, 21, 13, 1, 4, skin);
      px(g, 21, 16, sd);
      px(g, 20, 16, sd);
      break;
    case "bulbous":
      P(g, 21, 15, 2, 2, skin);
      px(g, 22, 16, sd);
      break;
    case "pointed":
      P(g, 21, 14, 1, 2, skin);
      px(g, 22, 14, skin);
      break;
    case "wide":
      P(g, 21, 14, 1, 3, skin);
      break;
    case "hooked":
      P(g, 21, 13, 1, 3, skin);
      px(g, 21, 16, sd);
      px(g, 20, 16, sd);
      break;
    case "snub":
      P(g, 21, 15, 1, 1, skin);
      px(g, 21, 14, skin);
      break;
    case "clown":
      P(g, 21, 14, 2, 3, "#e63946");
      break;
    default:
      P(g, 21, 14, 1, 2, skin);
  }
  // mouth
  const m = "#7a2e22";
  if (s.mouth === "grin" || s.mouth === "snarl") {
    P(g, 18, 19, 3, 2, m);
    P(g, 18, 19, 3, 1, "#fff");
  } else if (s.mouth === "scream") {
    P(g, 18, 19, 2, 2, "#3a0f0a");
  } else if (s.mouth === "smile") {
    P(g, 18, 19, 3, 1, m);
    px(g, 20, 18, m);
  } else {
    P(g, 18, 19, 3, 1, m);
  }
  P(g, 18, 20, 3, 1, sd); // chin
  if (gx === "m") {
    P(g, 17, 21, 4, 1, sd);
    P(g, 20, 19, 1, 2, skin);
  } else if (gx === "w") {
    clr(g, 20, 21);
    clr(g, 19, 21);
  }
  // accessory
  const glasses = s.accessory === "nerd-glasses" || s.accessory === "round-glasses" || s.accessory === "sunglasses" || s.accessory === "monocle";
  const beard = s.accessory === "full-beard" || s.accessory === "moustache" || s.accessory === "goatee";
  if (glasses) {
    const f = "#1c1c22";
    if (s.accessory === "sunglasses") {
      P(g, 15, 12, 4, 3, f);
    } else {
      P(g, 15, 12, 4, 1, f);
      P(g, 15, 14, 4, 1, f);
      px(g, 15, 13, f);
      px(g, 18, 13, f);
    }
    P(g, 12, 13, 3, 1, f); // temple
    if (s.accessory === "monocle") {
      clr(g, 15, 12);
      clr(g, 15, 14);
      px(g, 18, 16, "#d9b34a");
    }
  } else if (beard) {
    if (s.accessory === "moustache") {
      P(g, 18, 18, 3, 1, h);
    } else if (s.accessory === "goatee") {
      P(g, 18, 18, 3, 1, h);
      P(g, 18, 21, 3, 1, h);
    } else {
      P(g, 16, 17, 5, 5, h);
      clr(g, 18, 19);
      clr(g, 19, 19);
      P(g, 13, 16, 3, 4, h);
    }
  }
  // hair
  if (s.hair !== "bald") {
    const hc = s.hair === "blow-wave" ? "#d9a441" : s.hair === "mohawk" ? "#e63946" : h;
    if (s.hair === "mohawk") {
      P(g, 10, 3, 3, 6, "#e63946");
      P(g, 10, 8, 11, 2, h);
    } else {
      P(g, 8, 6, 13, 3, hc);
      P(g, 7, 8, 2, 9, hc);
      if (s.hair === "mullet") {
        P(g, 6, 16, 2, 6, hc);
      }
      if (s.hair === "bun") {
        P(g, 6, 8, 3, 3, hc);
      }
      if (s.hair === "tousled" || s.hair === "messy") {
        px(g, 7, 5, hc);
        px(g, 10, 4, hc);
        px(g, 13, 5, hc);
      }
    }
  }
  drawHat(g, s.hat, cloth);
}
