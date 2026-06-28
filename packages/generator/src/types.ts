/** Which way the figure faces. */
export type View = "front" | "left" | "right";

/**
 * The full description of an avatar. Every part is an index into the matching
 * catalog in {@link PART_NAMES} (or a palette in `palettes.ts`). All indices are
 * clamped on decode, so out-of-range numbers never throw — they fall back to a
 * default.
 */
export interface AvatarConfig {
  /** Headgear, 0–7 (`PART_NAMES.hut`). */
  hut: number;
  /** Hair style, 0–7 (`PART_NAMES.haare`). */
  haare: number;
  /** Ear shape, 0–7 (`PART_NAMES.ohren`). */
  ohren: number;
  /** Nose, 0–7 (`PART_NAMES.nase`). */
  nase: number;
  /** Mouth, 0–7 (`PART_NAMES.mund`). */
  mund: number;
  /** Upper body / clothing cut, 0–7 (`PART_NAMES.torso`). */
  torso: number;
  /** Trousers, 0–7 (`PART_NAMES.hose`). */
  hose: number;
  /** Skin tone, index into `SKIN`. */
  skin: number;
  /** Clothing colour, index into `CLOTH`. */
  cloth: number;
  /** Background colour, index into `BG`. */
  bg: number;
  /** Head/body build, 0–2 (`PART_NAMES.gender`). */
  gender: number;
  /** Accessory — glasses or beard, 0–7 (`PART_NAMES.acc`). */
  acc: number;
  /** Facing direction. */
  view: View;
}

/** Keys of {@link AvatarConfig} that are catalogued part choices. */
export type PartKey =
  | "hut"
  | "haare"
  | "ohren"
  | "nase"
  | "mund"
  | "torso"
  | "hose"
  | "gender"
  | "acc";

/**
 * Anything we can draw onto: a 2D context. The library only relies on the
 * subset of the canvas 2D API shared by `CanvasRenderingContext2D` and
 * `OffscreenCanvasRenderingContext2D`.
 */
export type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** A drawable image source produced by the offscreen sprite compositor. */
export type SpriteCanvas = HTMLCanvasElement | OffscreenCanvas;
