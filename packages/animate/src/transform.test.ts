import { describe, it, expect } from "vitest";
import { getPoseTransform } from "./transform.js";

describe("getPoseTransform", () => {
  it("is neutral for idle at t=0", () => {
    const tr = getPoseTransform("idle", 0);
    expect(tr).toMatchObject({ dx: 0, dy: 0, rot: 0, flash: false });
  });

  it("recoils left and flashes early in the hurt pose", () => {
    const tr = getPoseTransform("hurt", 0.01);
    expect(tr.dx).toBeLessThan(0);
    expect(tr.flash).toBe(true);
  });

  it("lunges right during the attack windup", () => {
    const tr = getPoseTransform("attack", 0.15);
    expect(tr.dx).toBeGreaterThan(0);
    expect(tr.sx).toBeGreaterThan(1);
  });

  it("is deterministic", () => {
    expect(getPoseTransform("win", 1.23)).toEqual(getPoseTransform("win", 1.23));
  });
});
