import type { PartId } from "./palettes.js";

/** Which way the figure faces. */
export type View = "front" | "left" | "right";

/**
 * The full description of an avatar. Parts are **string ids** from the catalog
 * (see `PARTS`), so you get autocomplete and validation:
 * `{ hat: "top-hat", hair: "mohawk", … }`. Colours are **hex strings** and may
 * be any `#rrggbb` value, not just the editor palette. Invalid values are
 * repaired by `normalizeConfig` (never throws).
 */
export interface AvatarConfig {
  /** Headgear. */
  hat: PartId<"hat">;
  /** Hair style. */
  hair: PartId<"hair">;
  /** Ear shape. */
  ears: PartId<"ears">;
  /** Nose. */
  nose: PartId<"nose">;
  /** Mouth. */
  mouth: PartId<"mouth">;
  /** Upper body / clothing cut. */
  top: PartId<"top">;
  /** Trousers. */
  trousers: PartId<"trousers">;
  /** Body build (small / medium / large). */
  build: PartId<"build">;
  /** Accessory — glasses or beard. */
  accessory: PartId<"accessory">;
  /** Footwear. */
  shoes: PartId<"shoes">;
  /** Skin tone, any `#rrggbb` hex. */
  skin: string;
  /** Clothing colour, any `#rrggbb` hex. */
  clothing: string;
  /** Background colour, any `#rrggbb` hex. */
  background: string;
  /** Facing direction. */
  view: View;
}

/**
 * Anything we can draw onto: a 2D context. The library only relies on the
 * subset of the canvas 2D API shared by `CanvasRenderingContext2D` and
 * `OffscreenCanvasRenderingContext2D`.
 */
export type Ctx2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

/** A drawable image source produced by the offscreen sprite compositor. */
export type SpriteCanvas = HTMLCanvasElement | OffscreenCanvas;
