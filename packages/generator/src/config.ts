import type { AvatarConfig, PartKey, View } from "./types.js";
import { PART_IDS, SKIN, CLOTH, BG } from "./palettes.js";
import { createRng, type Rng } from "./rng.js";

/** The avatar shown before the user changes anything — a plain everyman. */
export const DEFAULT_CONFIG: Readonly<AvatarConfig> = Object.freeze({
  hut: 1,
  haare: 1,
  ohren: 0,
  nase: 0,
  mund: 0,
  torso: 0,
  hose: 0,
  skin: 2,
  cloth: 2,
  bg: 1,
  gender: 1,
  acc: 0,
  view: "front",
});

const VIEWS: readonly View[] = ["front", "left", "right"];
const PART_KEYS: readonly PartKey[] = ["hut", "haare", "ohren", "nase", "mund", "torso", "hose", "gender", "acc"];
const COLOR_KEYS = { skin: SKIN, cloth: CLOTH, bg: BG } as const;

function clampInt(v: unknown, n: number, fallback: number): number {
  return Number.isInteger(v) && (v as number) >= 0 && (v as number) < n ? (v as number) : fallback;
}

/**
 * Coerce a loose / partial object into a valid {@link AvatarConfig}. Missing
 * keys take their {@link DEFAULT_CONFIG} value; out-of-range indices are
 * clamped to the default. Never throws.
 */
export function normalizeConfig(input: Partial<AvatarConfig> = {}): AvatarConfig {
  const out = { ...DEFAULT_CONFIG } as AvatarConfig;
  for (const key of PART_KEYS) {
    out[key] = clampInt(input[key], PART_IDS[key].length, DEFAULT_CONFIG[key]);
  }
  for (const key of Object.keys(COLOR_KEYS) as Array<keyof typeof COLOR_KEYS>) {
    out[key] = clampInt(input[key], COLOR_KEYS[key].length, DEFAULT_CONFIG[key]);
  }
  out.view = (typeof input.view === "string" && VIEWS.includes(input.view) ? input.view : DEFAULT_CONFIG.view) as View;
  return out;
}

/* ---------- serialization ---------- */

/** Resolve a serialized part value (string id or raw index) to a valid index. */
function resolvePart(key: PartKey, value: unknown, fallback: number): number {
  if (typeof value === "string") {
    const i = PART_IDS[key].indexOf(value);
    return i >= 0 ? i : fallback;
  }
  return clampInt(value, PART_IDS[key].length, fallback);
}

/** Resolve a serialized colour value (hex string or raw index) to a valid index. */
function resolveColor(palette: readonly string[], value: unknown, fallback: number): number {
  if (typeof value === "string") {
    const i = palette.indexOf(value.toLowerCase());
    return i >= 0 ? i : fallback;
  }
  return clampInt(value, palette.length, fallback);
}

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
 * The plain object embedded in a config code: every part as its stable string
 * id and every colour as its hex value. Human-readable and order-independent.
 */
export interface SerializedConfig {
  hut: string;
  haare: string;
  ohren: string;
  nase: string;
  mund: string;
  torso: string;
  hose: string;
  skin: string;
  cloth: string;
  bg: string;
  gender: string;
  acc: string;
  view: View;
}

/** Convert a config to its readable, string-valued serialized form. */
export function toSerializable(config: AvatarConfig): SerializedConfig {
  const c = normalizeConfig(config);
  return {
    hut: PART_IDS.hut[c.hut],
    haare: PART_IDS.haare[c.haare],
    ohren: PART_IDS.ohren[c.ohren],
    nase: PART_IDS.nase[c.nase],
    mund: PART_IDS.mund[c.mund],
    torso: PART_IDS.torso[c.torso],
    hose: PART_IDS.hose[c.hose],
    skin: SKIN[c.skin],
    cloth: CLOTH[c.cloth],
    bg: BG[c.bg],
    gender: PART_IDS.gender[c.gender],
    acc: PART_IDS.acc[c.acc],
    view: c.view,
  };
}

/** Restore a config from its serialized form, clamping anything unknown. */
export function fromSerializable(data: Partial<SerializedConfig>, fallback: AvatarConfig = DEFAULT_CONFIG as AvatarConfig): AvatarConfig {
  const fb = normalizeConfig(fallback);
  return {
    hut: resolvePart("hut", data.hut, fb.hut),
    haare: resolvePart("haare", data.haare, fb.haare),
    ohren: resolvePart("ohren", data.ohren, fb.ohren),
    nase: resolvePart("nase", data.nase, fb.nase),
    mund: resolvePart("mund", data.mund, fb.mund),
    torso: resolvePart("torso", data.torso, fb.torso),
    hose: resolvePart("hose", data.hose, fb.hose),
    skin: resolveColor(SKIN, data.skin, fb.skin),
    cloth: resolveColor(CLOTH, data.cloth, fb.cloth),
    bg: resolveColor(BG, data.bg, fb.bg),
    gender: resolvePart("gender", data.gender, fb.gender),
    acc: resolvePart("acc", data.acc, fb.acc),
    view: typeof data.view === "string" && VIEWS.includes(data.view) ? data.view : fb.view,
  };
}

/**
 * Encode a config into a compact, shareable code: base64 of the readable
 * {@link SerializedConfig} JSON. Round-trips through {@link decodeConfig}.
 */
export function encodeConfig(config: AvatarConfig): string {
  return toBase64(JSON.stringify(toSerializable(config)));
}

/**
 * Decode a code produced by {@link encodeConfig} back into a config. Invalid or
 * corrupt codes resolve to `fallback` (the default avatar) instead of throwing.
 */
export function decodeConfig(code: string, fallback: AvatarConfig = DEFAULT_CONFIG as AvatarConfig): AvatarConfig {
  try {
    const data = JSON.parse(fromBase64(code.trim())) as Partial<SerializedConfig>;
    if (!data || typeof data !== "object") return normalizeConfig(fallback);
    return fromSerializable(data, fallback);
  } catch {
    return normalizeConfig(fallback);
  }
}

/* ---------- generation ---------- */

const pick = (rng: Rng, n: number) => Math.floor(rng() * n);

/** Build a fresh config by drawing every part from `rng`. View stays "front". */
function buildConfig(rng: Rng): AvatarConfig {
  return {
    hut: pick(rng, PART_IDS.hut.length),
    haare: pick(rng, PART_IDS.haare.length),
    ohren: pick(rng, PART_IDS.ohren.length),
    nase: pick(rng, PART_IDS.nase.length),
    mund: pick(rng, PART_IDS.mund.length),
    torso: pick(rng, PART_IDS.torso.length),
    hose: pick(rng, PART_IDS.hose.length),
    skin: pick(rng, SKIN.length),
    cloth: pick(rng, CLOTH.length),
    bg: pick(rng, BG.length),
    gender: pick(rng, PART_IDS.gender.length),
    acc: pick(rng, PART_IDS.acc.length),
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
