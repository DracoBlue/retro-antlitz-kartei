import { describe, it, expect } from "vitest";
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  encodeConfig,
  decodeConfig,
  randomConfig,
  configFromSeed,
} from "./config.js";
import { PARTS, PART_LABELS, partIndex, partLabel } from "./palettes.js";
import { createRng } from "./rng.js";
import type { AvatarConfig } from "./types.js";

describe("catalogs", () => {
  it("labels stay parallel to part ids", () => {
    for (const key of Object.keys(PARTS) as Array<keyof typeof PARTS>) {
      expect(PART_LABELS[key].length).toBe(PARTS[key].length);
    }
  });

  it("maps ids to labels and back to indices", () => {
    expect(partIndex("hat", "top-hat")).toBe(1);
    expect(partLabel("hat", "top-hat")).toBe("Top Hat");
    expect(partIndex("hat", "does-not-exist")).toBe(-1);
  });
});

describe("config shape", () => {
  it("uses readable string ids and hex colours, not indices", () => {
    expect(DEFAULT_CONFIG.hat).toBe("top-hat");
    expect(DEFAULT_CONFIG.build).toBe("medium");
    expect(DEFAULT_CONFIG.skin).toMatch(/^#[0-9a-f]{6}$/i);
    expect(DEFAULT_CONFIG.view).toBe("front");
    // English keys
    expect(Object.keys(DEFAULT_CONFIG).sort()).toEqual(
      ["accessory", "background", "build", "clothing", "ears", "hair", "hat", "mouth", "nose", "shoes", "skin", "top", "trousers", "view"],
    );
  });
});

describe("share codes", () => {
  it("round-trips through encode/decode", () => {
    const cfg = randomConfig(createRng("round-trip"));
    expect(decodeConfig(encodeConfig(cfg))).toEqual(cfg);
  });

  it("falls back to default on corrupt codes", () => {
    expect(decodeConfig("!!!not-base64!!!")).toEqual(normalizeConfig(DEFAULT_CONFIG as AvatarConfig));
    expect(decodeConfig("")).toEqual(normalizeConfig(DEFAULT_CONFIG as AvatarConfig));
  });

  it("clamps unknown ids and bad colours back to the default", () => {
    const cfg = normalizeConfig({ hat: "does-not-exist" as never, skin: "not-a-hex" });
    expect(cfg.hat).toBe(DEFAULT_CONFIG.hat);
    expect(cfg.skin).toBe(DEFAULT_CONFIG.skin);
  });

  it("accepts any valid hex colour, not just the palette", () => {
    expect(normalizeConfig({ skin: "#123456" }).skin).toBe("#123456");
  });
});

describe("normalizeConfig", () => {
  it("fills defaults and keeps valid values", () => {
    const cfg = normalizeConfig({ hat: "crown", view: "left", nose: "clown" });
    expect(cfg.hat).toBe("crown");
    expect(cfg.nose).toBe("clown");
    expect(cfg.view).toBe("left");
    expect(cfg.hair).toBe(DEFAULT_CONFIG.hair);
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
