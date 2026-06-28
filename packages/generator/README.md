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
const cfg = normalizeConfig({ hat: "crown", top: "leather-jacket", skin: "#8d5524", view: "left" });
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
- `encodeConfig` / `decodeConfig` — share codes (base64 of the config JSON).
- `createRng(seed)` — the seeded PRNG used internally.
- Catalogs & palettes: `PARTS` (id arrays), `PART_LABELS`, `partIndex`,
  `partLabel`, `SKIN`, `CLOTH`, `BG`, `PANTS`, `HAIR`, `COLS`, `ROWS`, plus the
  `shade` colour helper and `createCanvas`.

## Config shape

Parts are **string ids** (typed unions, so you get autocomplete); colours are
**hex strings** and may be any `#rrggbb`, not just the editor palette:

```ts
interface AvatarConfig {
  hat: "none" | "top-hat" | "crown" | …;
  hair: "bald" | "side-part" | "tousled" | …;
  ears: "normal" | "sail-ears" | …;
  nose: "button" | "aquiline" | …;
  mouth: "smile" | "grimace" | …;
  top: "suit" | "shirt" | …;
  trousers: "suit-trousers" | "jeans" | …;
  build: "small" | "medium" | "large";
  accessory: "none" | "nerd-glasses" | "full-beard" | …;
  shoes: "sneakers" | "boots" | "dress-shoes" | "clown-shoes" | …;
  skin: string;       // hex, e.g. "#e0ac69"
  clothing: string;   // hex
  background: string; // hex
  view: "front" | "left" | "right";
}
```

The full id lists live in `PARTS`; `PART_LABELS[key][i]` and `partLabel(key, id)`
give display labels.

## Extending — adding a part

No numbers to keep in sync. To add, say, a new hat:

1. Append the id to `PARTS.hat` and a label to `PART_LABELS.hat` (any position).
2. Add a matching `case "your-hat":` to `drawHat` (and the side-view branch if
   it should show in profile).

Existing configs, share codes and snapshots stay valid — parts are dispatched
by **id**, never by array position.

## Environments

Needs a Canvas 2D implementation. Browsers and workers work out of the box
(`OffscreenCanvas` or `<canvas>`). In Node, provide an `OffscreenCanvas`
polyfill or shim `document.createElement("canvas")` with a canvas library such
as `@napi-rs/canvas`.

## License

[MIT](./LICENSE) © DracoBlue
