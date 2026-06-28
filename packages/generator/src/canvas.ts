import type { Ctx2D, SpriteCanvas } from "./types.js";

/**
 * Create a small offscreen drawing surface. Prefers `OffscreenCanvas` when
 * available (workers, modern browsers, Node with a canvas polyfill) and falls
 * back to a detached `<canvas>` element in the DOM. Throws if neither exists —
 * this library needs a Canvas 2D implementation to run.
 */
export function createCanvas(width: number, height: number): { canvas: SpriteCanvas; ctx: Ctx2D } {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("retro-antlitz-kartei: OffscreenCanvas 2D context unavailable");
    return { canvas, ctx: ctx as Ctx2D };
  }
  if (typeof document !== "undefined") {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("retro-antlitz-kartei: canvas 2D context unavailable");
    return { canvas, ctx };
  }
  throw new Error(
    "retro-antlitz-kartei: no Canvas implementation found. Provide an OffscreenCanvas polyfill (e.g. node-canvas) in non-DOM environments.",
  );
}
