import { Canvas } from "@napi-rs/canvas";

/**
 * Install a minimal `document.createElement("canvas")` shim backed by
 * `@napi-rs/canvas` so the generator's {@link createCanvas} works under Node /
 * Vitest. Test-only — never imported by the published bundle.
 */
export function installCanvasShim(): void {
  if (typeof (globalThis as { document?: unknown }).document !== "undefined") return;
  (globalThis as { document?: unknown }).document = {
    createElement(tag: string) {
      if (tag !== "canvas") throw new Error("canvasShim: only <canvas> is supported");
      return new Canvas(1, 1);
    },
  };
}
