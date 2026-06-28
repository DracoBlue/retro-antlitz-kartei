import type { AvatarConfig, Ctx2D, SpriteCanvas, View } from "./types.js";
import { createCanvas } from "./canvas.js";
import { shade } from "./color.js";
import { HAIR } from "./palettes.js";
import {
  COLS,
  ROWS,
  P,
  px,
  clr,
  drawTrousers,
  drawShoes,
  drawTop,
  drawHead,
  drawEars,
  drawNose,
  drawMouth,
  drawBeard,
  drawHair,
  drawGlasses,
  drawHat,
  drawSide,
  type GlassesId,
  type BeardId,
} from "./parts.js";

const GLASSES: readonly string[] = ["nerd-glasses", "round-glasses", "sunglasses", "monocle"];
const BEARDS: readonly string[] = ["full-beard", "moustache", "goatee"];

/**
 * Compose the avatar described by `config` into a transparent, outlined
 * {@link COLS}×{@link ROWS} sprite. The returned canvas faces the requested
 * `view` ("right" for both side views — the renderer mirrors "left").
 *
 * This is the unit of work shared by the static renderer and the animator: it
 * produces a clean sprite you can `drawImage` anywhere, scaled with nearest
 * neighbour for crisp pixels.
 */
export function composeSprite(config: AvatarConfig, view: View = config.view): SpriteCanvas {
  const { canvas, ctx: g } = createCanvas(COLS, ROWS);
  g.imageSmoothingEnabled = false;

  const { skin, topColor, accessory } = config;
  const gx: "m" | "w" | "n" = config.build === "small" ? "w" : config.build === "large" ? "m" : "n";

  if (view === "left" || view === "right") {
    drawSide(
      g,
      {
        hat: config.hat,
        hair: config.hair,
        nose: config.nose,
        mouth: config.mouth,
        accessory: config.accessory,
        top: config.top,
        trousers: config.trousers,
        shoes: config.shoes,
      },
      skin,
      topColor,
      config.trousersColor,
      gx,
    );
  } else {
    drawTrousers(g, config.trousers, config.trousersColor, skin);
    drawShoes(g, config.shoes, skin);
    drawTop(g, config.top, topColor, skin);
    if (gx === "w") {
      clr(g, 8, 24);
      clr(g, 23, 24);
    }
    drawHead(g, skin);
    if (gx === "w") {
      clr(g, 10, 21);
      clr(g, 21, 21);
      clr(g, 9, 20);
      clr(g, 22, 20);
    } else if (gx === "m") {
      P(g, 9, 21, 1, 1, skin);
      P(g, 22, 21, 1, 1, skin);
      P(g, 10, 21, 12, 1, shade(skin, -0.22));
    }
    drawEars(g, config.ears, skin);
    // eyes
    P(g, 11, 12, 2, 1, HAIR);
    P(g, 18, 12, 2, 1, HAIR);
    P(g, 11, 13, 2, 2, "#fff");
    P(g, 18, 13, 2, 2, "#fff");
    px(g, 12, 14, "#26324a");
    px(g, 18, 14, "#26324a");
    if (gx === "w") {
      px(g, 10, 13, HAIR);
      px(g, 10, 12, HAIR);
      px(g, 20, 13, HAIR);
      px(g, 20, 12, HAIR);
    }
    drawNose(g, config.nose, skin);
    if (BEARDS.includes(accessory)) drawBeard(g, accessory as BeardId);
    drawMouth(g, config.mouth);
    drawHair(g, config.hair);
    if (GLASSES.includes(accessory)) drawGlasses(g, accessory as GlassesId);
    drawHat(g, config.hat, topColor);
  }

  outline(g);
  return canvas;
}

/** Trace a one-pixel dark outline around every opaque edge of the sprite. */
function outline(g: Ctx2D): void {
  const img = g.getImageData(0, 0, COLS, ROWS).data;
  const op = (x: number, y: number) => (x < 0 || y < 0 || x >= COLS || y >= ROWS ? 0 : img[(y * COLS + x) * 4 + 3]);
  const edge: Array<[number, number]> = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      if (
        op(x, y) === 0 &&
        (op(x - 1, y) ||
          op(x + 1, y) ||
          op(x, y - 1) ||
          op(x, y + 1) ||
          op(x - 1, y - 1) ||
          op(x + 1, y - 1) ||
          op(x - 1, y + 1) ||
          op(x + 1, y + 1))
      )
        edge.push([x, y]);
    }
  g.fillStyle = "#181018";
  for (const [x, y] of edge) g.fillRect(x, y, 1, 1);
}
