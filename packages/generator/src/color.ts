/**
 * Lighten (`f > 0`) or darken (`f < 0`) a `#rrggbb` colour by a factor in
 * `[-1, 1]`. Lightening blends towards white; darkening scales the channels
 * towards black. Returns a `#rrggbb` string.
 */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (f < 0) {
    const k = 1 + f;
    r *= k;
    g *= k;
    b *= k;
  } else {
    r += (255 - r) * f;
    g += (255 - g) * f;
    b += (255 - b) * f;
  }
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}
