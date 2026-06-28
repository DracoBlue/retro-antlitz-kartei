import type { AvatarConfig, Ctx2D, SpriteCanvas } from "./types.js";
import { shade } from "./color.js";
import { COLS, ROWS } from "./parts.js";
import { composeSprite } from "./compose.js";

/** A canvas the renderer can draw onto (DOM or offscreen). */
export type RenderTarget = HTMLCanvasElement | OffscreenCanvas;

export interface RenderOptions {
  /**
   * Draw the gradient background and floor strip behind the figure. Pass a hex
   * string to override the palette colour, `false` to render the figure on a
   * transparent canvas. Default: the `bg` colour from `config`.
   */
  background?: boolean | string;
  /** Draw the darker floor strip along the bottom. Default `true`. */
  floor?: boolean;
  /**
   * A pre-composed sprite to draw instead of composing from `config`. Lets the
   * animator reuse one sprite across many frames. When omitted the sprite is
   * composed from `config.view`.
   */
  sprite?: SpriteCanvas;
}

/** Paint the gradient backdrop and floor strip used by the static avatar view. */
export function drawBackground(ctx: Ctx2D, w: number, h: number, bg: string, floor = true): void {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, shade(bg, 0.12));
  grad.addColorStop(1, shade(bg, -0.32));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  if (floor) {
    ctx.fillStyle = shade(bg, -0.42);
    ctx.fillRect(0, h - 30, w, 30);
  }
}

/**
 * Render `config` onto `canvas`, scaled to fill it with crisp nearest-neighbour
 * pixels and centred. Mirrors the sprite for the "left" view. The canvas keeps
 * its current `width`/`height`; size the canvas before calling.
 */
export function renderAvatar(canvas: RenderTarget, config: AvatarConfig, opts: RenderOptions = {}): void {
  const ctx = canvas.getContext("2d") as Ctx2D | null;
  if (!ctx) throw new Error("retro-antlitz-kartei: target canvas has no 2D context");
  const w = canvas.width;
  const h = canvas.height;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  const { background = true, floor = true, sprite } = opts;
  if (background !== false) {
    const bg = typeof background === "string" ? background : config.background;
    drawBackground(ctx, w, h, bg, floor);
  }

  const off = sprite ?? composeSprite(config, config.view);
  const scale = Math.floor(Math.min(w / COLS, h / ROWS));
  const dw = COLS * scale;
  const dh = ROWS * scale;
  const dx = Math.floor((w - dw) / 2);
  const dy = Math.floor((h - dh) / 2) - 6;

  ctx.save();
  if (config.view === "left") {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(off as CanvasImageSource, 0, 0, COLS, ROWS, dx, dy, dw, dh);
  ctx.restore();
}
