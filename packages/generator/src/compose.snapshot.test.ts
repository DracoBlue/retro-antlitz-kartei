import { describe, it, expect, beforeAll } from "vitest";
import { installCanvasShim } from "./testing/canvasShim.js";
import { composeSprite } from "./compose.js";
import { normalizeConfig, configFromSeed } from "./config.js";
import { COLS, ROWS } from "./parts.js";
import type { AvatarConfig, View } from "./types.js";

const RAMP = ".:-=+*oO#@";

/** Render a sprite to a deterministic, human-readable ASCII map (shape + tone). */
function spriteToAscii(config: AvatarConfig, view: View): string {
  const sprite = composeSprite(config, view) as unknown as {
    getContext(t: "2d"): { getImageData(x: number, y: number, w: number, h: number): { data: Uint8ClampedArray } };
  };
  const data = sprite.getContext("2d").getImageData(0, 0, COLS, ROWS).data;
  const lines: string[] = [];
  for (let y = 0; y < ROWS; y++) {
    let line = "";
    for (let x = 0; x < COLS; x++) {
      const i = (y * COLS + x) * 4;
      const a = data[i + 3];
      if (a < 128) {
        line += " ";
        continue;
      }
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      line += RAMP[Math.min(RAMP.length - 1, Math.floor((lum / 255) * RAMP.length))];
    }
    lines.push(line.replace(/\s+$/, ""));
  }
  return "\n" + lines.join("\n") + "\n";
}

beforeAll(() => installCanvasShim());

describe("sprite snapshots", () => {
  const everyman = normalizeConfig({});

  it("renders the default everyman, front", () => {
    expect(spriteToAscii(everyman, "front")).toMatchSnapshot();
  });

  it("renders side profiles (left mirrors right at draw time)", () => {
    expect(spriteToAscii(everyman, "right")).toMatchSnapshot();
  });

  it("renders a fully decorated figure", () => {
    const fancy = normalizeConfig({
      hat: "crown",
      hair: "mohawk",
      ears: "elf",
      nose: "clown",
      mouth: "grin",
      top: "hi-vis-vest",
      trousers: "shorts",
      accessory: "full-beard",
      build: "large",
    });
    expect(spriteToAscii(fancy, "front")).toMatchSnapshot();
  });

  it("is stable for a given seed", () => {
    expect(spriteToAscii(configFromSeed("Ada Lovelace"), "front")).toMatchSnapshot();
  });

  it("draws shoes in front and profile", () => {
    const booted = normalizeConfig({ trousers: "jeans", shoes: "boots" });
    expect(spriteToAscii(booted, "front")).toMatchSnapshot();
    expect(spriteToAscii(booted, "right")).toMatchSnapshot();
    expect(spriteToAscii(normalizeConfig({ shoes: "clown-shoes" }), "front")).toMatchSnapshot();
  });
});
