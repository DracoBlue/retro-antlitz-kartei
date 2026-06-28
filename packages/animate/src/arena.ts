import type { Ctx2D, SpriteCanvas } from "@retro-antlitz-kartei/generator";
import { COLS, ROWS } from "@retro-antlitz-kartei/generator";
import type { Pose } from "./poses.js";
import { getPoseTransform } from "./transform.js";

export interface DrawArenaOptions {
  /** Pixels per sprite cell. Default `7` (a 32×40 sprite becomes 224×280). */
  scale?: number;
  /** Draw the neon arena backdrop and floor. Default `true`. */
  background?: boolean;
}

/**
 * Draw a single animation frame: the neon arena backdrop, ground shadow, the
 * `sprite` transformed for `pose`, and the pose's particle/flash effects.
 *
 * `t` is elapsed time in **seconds** — drive it from a clock so the animation
 * advances. This function is stateless; the {@link AvatarArena} driver owns the
 * clock and the render loop.
 */
export function drawArenaFrame(
  ctx: Ctx2D,
  w: number,
  h: number,
  sprite: SpriteCanvas | null,
  pose: Pose,
  t: number,
  opts: DrawArenaOptions = {},
): void {
  const { scale = 7, background = true } = opts;
  ctx.imageSmoothingEnabled = false;

  const floorY = h * 0.78;

  if (background) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#241141");
    g.addColorStop(1, "#0c0618");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#160a26";
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(123,47,247,0.45)";
    for (let i = 1; i < 6; i++) {
      const y = floorY + (h - floorY) * (i / 6);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "#ff2e88";
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(w, floorY);
    ctx.stroke();
  } else {
    ctx.clearRect(0, 0, w, h);
  }

  if (!sprite) return;

  const sw = COLS * scale;
  const sh = ROWS * scale;
  const cx = w / 2;
  const feetY = floorY + 8;

  const { dx, dy, rot, sx, sy, flash } = getPoseTransform(pose, t);

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(cx + dx * 0.5, feetY, sw * 0.32, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // sprite
  ctx.save();
  ctx.translate(cx + dx, feetY - sh / 2 + dy);
  ctx.rotate(rot);
  ctx.scale(sx, sy);
  ctx.drawImage(sprite as CanvasImageSource, 0, 0, COLS, ROWS, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();

  // effects
  if (pose === "attack") {
    const k = (t * 1.6) % 1;
    if (k < 0.45) {
      ctx.strokeStyle = "rgba(255,255,255," + (0.9 - k * 1.6) + ")";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx + dx + sw * 0.34, feetY - sh * 0.45, 32, -0.9, 0.9);
      ctx.stroke();
    }
  } else if (pose === "block") {
    const a = 0.45 + Math.sin(t * 10) * 0.18;
    ctx.strokeStyle = "rgba(90,180,255," + a + ")";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx + dx + sw * 0.2, feetY - sh * 0.5, 38, -1.1, 1.1);
    ctx.stroke();
  } else if (pose === "walk") {
    for (let i = 0; i < 3; i++) {
      const p = (t * 2 + i / 3) % 1;
      ctx.fillStyle = "rgba(180,140,255," + 0.5 * (1 - p) + ")";
      ctx.beginPath();
      ctx.arc(cx - sw * 0.18 - p * 22, feetY - 2 - p * 4, 2 + p * 5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (pose === "win") {
    const colors = ["#ffe600", "#ff2e88", "#00f0ff"];
    for (let i = 0; i < 7; i++) {
      const a = t * 2 + i * 1.1;
      ctx.fillStyle = colors[i % 3];
      ctx.fillRect(cx + Math.cos(a) * (46 + i * 7), feetY - sh * 0.5 + Math.sin(a * 1.3) * 44, 5, 5);
    }
  }

  if (flash) {
    ctx.fillStyle = "rgba(255,50,50,0.4)";
    ctx.fillRect(0, 0, w, h);
  }
}
