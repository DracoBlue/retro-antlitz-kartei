import type { Pose } from "./poses.js";

/**
 * The per-frame motion of a posed figure, independent of any renderer. Apply it
 * to a sprite in your own engine (PixiJS, Three, plain canvas): offset by
 * `dx`/`dy`, rotate by `rot` (radians), scale by `sx`/`sy`, and react to
 * `flash` (the brief red hit-frame).
 *
 * `dx`/`dy` are pixel offsets calibrated for a ~7×-scaled sprite (the arena's
 * default). If you draw at a different scale, multiply them by your own factor.
 */
export interface PoseTransform {
  dx: number;
  dy: number;
  /** Rotation in radians. */
  rot: number;
  sx: number;
  sy: number;
  /** `true` on the brief impact frame of the "hurt" pose. */
  flash: boolean;
}

/**
 * Compute the {@link PoseTransform} for `pose` at elapsed time `t` (seconds).
 * This is the exact motion {@link drawArenaFrame} applies — exported so you can
 * drive a sprite in your own render loop (e.g. a PixiJS combat scene) without
 * the arena backdrop.
 */
export function getPoseTransform(pose: Pose, t: number): PoseTransform {
  let dx = 0;
  let dy = 0;
  let rot = 0;
  let sx = 1;
  let sy = 1;
  let flash = false;

  if (pose === "idle") {
    dy = Math.sin(t * 2.2) * 4;
    sy = 1 + Math.sin(t * 2.2) * 0.015;
  } else if (pose === "walk") {
    const w = t * 9;
    dy = -Math.abs(Math.sin(w)) * 8;
    rot = Math.sin(w) * 0.07;
  } else if (pose === "attack") {
    const k = (t * 1.6) % 1;
    const f = k < 0.25 ? k / 0.25 : k < 0.45 ? 1 - (k - 0.25) / 0.2 : 0;
    dx = f * 30;
    rot = f * 0.14;
    sx = 1 + f * 0.05;
  } else if (pose === "block") {
    sy = 0.9;
    dy = 10;
    rot = -0.05;
    dx = -6;
    sx = 1.04;
  } else if (pose === "hurt") {
    const k = (t * 2.2) % 1;
    const f = Math.max(0, (0.35 - k) / 0.35);
    dx = -f * 24;
    rot = -f * 0.16;
    flash = k < 0.18;
  } else if (pose === "win") {
    dy = -Math.abs(Math.sin(t * 3.4)) * 26;
    rot = Math.sin(t * 6) * 0.04;
  }

  return { dx, dy, rot, sx, sy, flash };
}
