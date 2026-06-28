import type { AvatarConfig, RenderTarget, SpriteCanvas, Ctx2D } from "@retro-antlitz-kartei/generator";
import { composeSprite } from "@retro-antlitz-kartei/generator";
import { drawArenaFrame, type DrawArenaOptions } from "./arena.js";
import type { Pose } from "./poses.js";

export interface AvatarArenaOptions extends DrawArenaOptions {
  /** Initial sprite to animate. Use `setConfig` to compose one from a config. */
  sprite?: SpriteCanvas | null;
  /** Initial pose. Default `"idle"`. */
  pose?: Pose;
  /** Start the render loop immediately. Default `true`. */
  autoStart?: boolean;
}

/**
 * Drives the combat arena: owns a clock and `requestAnimationFrame` loop, and
 * renders {@link drawArenaFrame} onto a canvas every frame. Swap the pose or
 * sprite live; the animation keeps running.
 *
 * ```ts
 * const arena = new AvatarArena(canvas);
 * arena.setConfig(configFromSeed("Ada"));
 * arena.setPose("attack");
 * ```
 */
export class AvatarArena {
  private readonly canvas: RenderTarget;
  private readonly ctx: Ctx2D;
  private sprite: SpriteCanvas | null;
  private currentPose: Pose;
  private readonly drawOpts: DrawArenaOptions;
  private raf: number | null = null;
  private t0: number | null = null;

  constructor(canvas: RenderTarget, opts: AvatarArenaOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d") as Ctx2D | null;
    if (!ctx) throw new Error("retro-antlitz-kartei/animate: target canvas has no 2D context");
    this.ctx = ctx;
    this.sprite = opts.sprite ?? null;
    this.currentPose = opts.pose ?? "idle";
    this.drawOpts = { scale: opts.scale, background: opts.background };
    if (opts.autoStart !== false) this.start();
    else this.renderOnce(0);
  }

  /** The pose currently playing. */
  get pose(): Pose {
    return this.currentPose;
  }

  /** Switch poses. Restarts the per-pose clock so timed poses play from frame 0. */
  setPose(pose: Pose): void {
    if (pose === this.currentPose) return;
    this.currentPose = pose;
    this.t0 = null;
  }

  /** Replace the animated sprite (e.g. after an edit). Pass `null` to clear. */
  setSprite(sprite: SpriteCanvas | null): void {
    this.sprite = sprite;
  }

  /** Compose a fresh sprite from `config` (always faces "right" for combat). */
  setConfig(config: AvatarConfig): void {
    this.sprite = composeSprite(config, "right");
  }

  /** Begin the animation loop. No-op if already running or no rAF is available. */
  start(): void {
    if (this.raf != null) return;
    if (typeof requestAnimationFrame === "undefined") {
      this.renderOnce(0);
      return;
    }
    const tick = (now: number) => {
      if (this.t0 == null) this.t0 = now;
      const t = (now - this.t0) / 1000;
      drawArenaFrame(this.ctx, this.canvas.width, this.canvas.height, this.sprite, this.currentPose, t, this.drawOpts);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  /** Pause the animation loop, leaving the last frame on screen. */
  stop(): void {
    if (this.raf != null && typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  /** Render exactly one frame at time `t` (seconds) without starting the loop. */
  renderOnce(t = 0): void {
    drawArenaFrame(this.ctx, this.canvas.width, this.canvas.height, this.sprite, this.currentPose, t, this.drawOpts);
  }

  /** Stop the loop and drop references. The canvas is left untouched. */
  destroy(): void {
    this.stop();
    this.sprite = null;
    this.t0 = null;
  }
}
