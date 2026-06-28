import { describe, it, expect } from "vitest";
import { POSES, POSE_NAMES } from "./poses.js";

describe("poses", () => {
  it("every pose has a label", () => {
    for (const p of POSES) {
      expect(typeof POSE_NAMES[p]).toBe("string");
      expect(POSE_NAMES[p].length).toBeGreaterThan(0);
    }
  });

  it("exposes the six combat poses", () => {
    expect([...POSES].sort()).toEqual(["attack", "block", "hurt", "idle", "walk", "win"]);
  });
});
