# @retro-antlitz-kartei/generator

Framework-free core for **retro pixel-art, full-body avatars**. Compose a 32×40
sprite, render it to a canvas, generate deterministically from a seed, and
encode/decode shareable codes. MIT licensed.

```bash
pnpm add @retro-antlitz-kartei/generator
```

## Usage

```ts
import {
  renderAvatar,
  composeSprite,
  configFromSeed,
  randomConfig,
  normalizeConfig,
  encodeConfig,
  decodeConfig,
} from "@retro-antlitz-kartei/generator";

// Deterministic from a seed — same seed, same avatar (like DiceBear).
renderAvatar(canvas, configFromSeed("Ada Lovelace"));

// Hand-built (missing keys filled, out-of-range clamped, never throws).
const cfg = normalizeConfig({ hut: 2, torso: 7, skin: 4, view: "left" });
renderAvatar(canvas, cfg);

// A raw, transparent, outlined sprite to draw yourself.
const sprite = composeSprite(cfg, "right"); // HTMLCanvasElement | OffscreenCanvas

// Share codes.
const code = encodeConfig(cfg);
const back = decodeConfig(code); // invalid -> default avatar
```

## API

- `renderAvatar(canvas, config, options?)` — draw scaled, centred, with gradient
  background + floor. `options`: `background` (`boolean | hexString`), `floor`,
  `sprite` (reuse a pre-composed sprite).
- `composeSprite(config, view?)` — a transparent, outlined 32×40 sprite canvas.
- `normalizeConfig(partial)` / `DEFAULT_CONFIG` — coerce/clamp loose input.
- `randomConfig(rng?)` — random avatar; pass an `Rng` for reproducibility.
- `configFromSeed(seed)` — deterministic avatar from a string.
- `encodeConfig` / `decodeConfig` / `toSerializable` / `fromSerializable` —
  share codes (readable string-valued JSON, base64).
- `createRng(seed)` — the seeded PRNG used internally.
- Catalogs & palettes: `PART_NAMES`, `PART_IDS`, `SKIN`, `CLOTH`, `BG`, `PANTS`,
  `HAIR`, `COLS`, `ROWS`, plus the `shade` colour helper and `createCanvas`.

## Config shape

```ts
interface AvatarConfig {
  hut: number;    // hat        0–7
  haare: number;  // hair       0–7
  ohren: number;  // ears       0–7
  nase: number;   // nose       0–7
  mund: number;   // mouth      0–7
  torso: number;  // top        0–7
  hose: number;   // trousers   0–7
  skin: number;   // index into SKIN
  cloth: number;  // index into CLOTH
  bg: number;     // index into BG
  gender: number; // build      0–2
  acc: number;    // accessory  0–7 (glasses / beards)
  view: "front" | "left" | "right";
}
```

Use `PART_NAMES[key][value]` for a display label and `PART_IDS[key][value]` for
a stable id.

## Environments

Needs a Canvas 2D implementation. Browsers and workers work out of the box
(`OffscreenCanvas` or `<canvas>`). In Node, provide an `OffscreenCanvas`
polyfill or shim `document.createElement("canvas")` with a canvas library such
as `@napi-rs/canvas`.

## License

[MIT](./LICENSE) © DracoBlue
