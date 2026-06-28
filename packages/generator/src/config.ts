import type { AvatarConfig, View } from "./types.js";
import { PARTS, SKIN, CLOTH, BG, type PartId, type PartKey } from "./palettes.js";
import { createRng, type Rng } from "./rng.js";

/** The avatar shown before the user changes anything — a plain everyman. */
export const DEFAULT_CONFIG: Readonly<AvatarConfig> = Object.freeze({
  hat: "top-hat",
  hair: "side-part",
  ears: "normal",
  nose: "button",
  mouth: "smile",
  top: "suit",
  trousers: "suit-trousers",
  build: "medium",
  accessory: "none",
  shoes: "dress-shoes",
  skin: SKIN[2], // #e0ac69
  clothing: CLOTH[2], // #3a86ff
  background: BG[1], // #3a86ff
  view: "front",
});

const VIEWS: readonly View[] = ["front", "left", "right"];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function normPart<K extends PartKey>(key: K, value: unknown): PartId<K> {
  return (PARTS[key] as readonly string[]).includes(value as string)
    ? (value as PartId<K>)
    : (DEFAULT_CONFIG[key] as PartId<K>);
}

function normColor(value: unknown, fallback: string): string {
  return typeof value === "string" && HEX_RE.test(value) ? value.toLowerCase() : fallback;
}

/**
 * Coerce a loose / partial object into a valid {@link AvatarConfig}. Unknown
 * part ids fall back to the {@link DEFAULT_CONFIG} value; non-hex colours fall
 * back to the default colour; missing keys take their default. Never throws.
 */
export function normalizeConfig(input: Partial<AvatarConfig> = {}): AvatarConfig {
  return {
    hat: normPart("hat", input.hat),
    hair: normPart("hair", input.hair),
    ears: normPart("ears", input.ears),
    nose: normPart("nose", input.nose),
    mouth: normPart("mouth", input.mouth),
    top: normPart("top", input.top),
    trousers: normPart("trousers", input.trousers),
    build: normPart("build", input.build),
    accessory: normPart("accessory", input.accessory),
    shoes: normPart("shoes", input.shoes),
    skin: normColor(input.skin, DEFAULT_CONFIG.skin),
    clothing: normColor(input.clothing, DEFAULT_CONFIG.clothing),
    background: normColor(input.background, DEFAULT_CONFIG.background),
    view: typeof input.view === "string" && VIEWS.includes(input.view) ? input.view : DEFAULT_CONFIG.view,
  };
}

/* ---------- share codes ---------- */

function toBase64(s: string): string {
  if (typeof Buffer !== "undefined") return Buffer.from(s, "utf-8").toString("base64");
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b: string): string {
  if (typeof Buffer !== "undefined") return Buffer.from(b, "base64").toString("utf-8");
  const bin = atob(b);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/**
 * Encode a config into a compact, shareable code: base64 of the (already
 * readable, string-valued) config JSON. Round-trips through {@link decodeConfig}.
 */
export function encodeConfig(config: AvatarConfig): string {
  return toBase64(JSON.stringify(normalizeConfig(config)));
}

/**
 * Decode a code produced by {@link encodeConfig} back into a config. Invalid or
 * corrupt codes resolve to `fallback` (the default avatar) instead of throwing.
 */
export function decodeConfig(code: string, fallback: AvatarConfig = DEFAULT_CONFIG as AvatarConfig): AvatarConfig {
  try {
    const data = JSON.parse(fromBase64(code.trim())) as Partial<AvatarConfig>;
    if (!data || typeof data !== "object") return normalizeConfig(fallback);
    return normalizeConfig({ ...normalizeConfig(fallback), ...data });
  } catch {
    return normalizeConfig(fallback);
  }
}

/* ---------- generation ---------- */

const pickId = <K extends PartKey>(rng: Rng, key: K): PartId<K> =>
  PARTS[key][Math.floor(rng() * PARTS[key].length)] as PartId<K>;
const pickColor = (rng: Rng, palette: readonly string[]): string => palette[Math.floor(rng() * palette.length)];

/** Build a fresh config by drawing every part from `rng`. View stays "front". */
function buildConfig(rng: Rng): AvatarConfig {
  return {
    hat: pickId(rng, "hat"),
    hair: pickId(rng, "hair"),
    ears: pickId(rng, "ears"),
    nose: pickId(rng, "nose"),
    mouth: pickId(rng, "mouth"),
    top: pickId(rng, "top"),
    trousers: pickId(rng, "trousers"),
    skin: pickColor(rng, SKIN),
    clothing: pickColor(rng, CLOTH),
    background: pickColor(rng, BG),
    build: pickId(rng, "build"),
    accessory: pickId(rng, "accessory"),
    // Appended last so existing seeds keep all their other parts unchanged.
    shoes: pickId(rng, "shoes"),
    view: "front",
  };
}

/** A random avatar. Pass your own {@link Rng} for reproducibility, else `Math.random`. */
export function randomConfig(rng: Rng = Math.random): AvatarConfig {
  return buildConfig(rng);
}

/**
 * A deterministic avatar derived from a seed string — the same seed always
 * produces the same avatar, like dicebear's `seed` option.
 */
export function configFromSeed(seed: string): AvatarConfig {
  return buildConfig(createRng(seed));
}
