import { describe, it, expect } from "vitest";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  encodeConfig,
  decodeConfig,
  toSerializable,
  fromSerializable,
  randomConfig,
  configFromSeed,
} from "./config.js";
import { PART_NAMES, PART_IDS } from "./palettes.js";
import { createRng } from "./rng.js";

describe("catalogs", () => {
  it("labels and ids stay parallel", () => {
    for (const key of Object.keys(PART_NAMES) as Array<keyof typeof PART_NAMES>) {
      expect(PART_IDS[key].length).toBe(PART_NAMES[key].length);
    }
  });
});

describe("serialization", () => {
  it("uses readable string values, not indices", () => {
    const s = toSerializable(DEFAULT_CONFIG as any);
    expect(s.hut).toBe("top-hat");
    expect(s.gender).toBe("medium");
    expect(s.skin).toMatch(/^#[0-9a-f]{6}$/i);
    expect(s.view).toBe("front");
  });

  it("round-trips through encode/decode", () => {
    const cfg = randomConfig(createRng("round-trip"));
    const code = encodeConfig(cfg);
    expect(decodeConfig(code)).toEqual(cfg);
  });

  it("round-trips through serializable form", () => {
    const cfg = configFromSeed("hello");
    expect(fromSerializable(toSerializable(cfg))).toEqual(cfg);
  });

  it("falls back to default on corrupt codes", () => {
    expect(decodeConfig("!!!not-base64!!!")).toEqual(normalizeConfig(DEFAULT_CONFIG as any));
    expect(decodeConfig("")).toEqual(normalizeConfig(DEFAULT_CONFIG as any));
  });

  it("clamps unknown ids back to the fallback", () => {
    const cfg = fromSerializable({ hut: "does-not-exist", skin: "#000000" });
    expect(cfg.hut).toBe(DEFAULT_CONFIG.hut);
    expect(cfg.skin).toBe(DEFAULT_CONFIG.skin); // unknown hex -> fallback
  });
});

describe("normalizeConfig", () => {
  it("fills defaults and clamps out-of-range", () => {
    const cfg = normalizeConfig({ hut: 999, view: "left", nase: 3 });
    expect(cfg.hut).toBe(DEFAULT_CONFIG.hut);
    expect(cfg.nase).toBe(3);
    expect(cfg.view).toBe("left");
  });
});

describe("seed determinism", () => {
  it("same seed yields the same avatar", () => {
    expect(configFromSeed("Alice")).toEqual(configFromSeed("Alice"));
  });

  it("different seeds usually differ", () => {
    expect(configFromSeed("Alice")).not.toEqual(configFromSeed("Bob"));
  });
});
