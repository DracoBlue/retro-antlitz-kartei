/** The combat/idle poses the arena can play. */
export type Pose = "idle" | "walk" | "attack" | "block" | "hurt" | "win";

/** All poses in display order. */
export const POSES: readonly Pose[] = ["idle", "walk", "attack", "block", "hurt", "win"];

/** Human-readable labels for each pose. */
export const POSE_NAMES: Record<Pose, string> = {
  idle: "Idle",
  walk: "Walk",
  attack: "Attack",
  block: "Block",
  hurt: "Hit",
  win: "Win",
};
