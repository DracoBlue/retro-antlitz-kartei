# @retro-antlitz-kartei/generator

## 0.3.0

### Minor Changes

- 73ab1c6: Add two skirt-style `trousers` options — `dress` (a long A-line skirt) and
  `mini-skirt` (a short skirt with bare legs) — in front and profile views. Also
  make the hi-vis vest's centre panel follow `topColor` instead of a hardcoded
  grey (the vest body stays safety-orange).
- 78a1e95: Add a `lashes` accessory (eyelashes). Eyelashes are no longer tied to the build:
  `small`/`thin` no longer draw lashes automatically — pick the `lashes` accessory
  instead. As an accessory it is mutually exclusive with glasses and beards.
- 78a1e95: Add a `long` hairstyle — covers the ears and falls past the shoulders, in front
  and profile views, following `hairColor`.
- 78a1e95: Add a `thin` build (slimmer than `small`) with a trimmed silhouette in both
  front and profile views; `small` and `thin` now also read thinner in profile
  (previously all builds were the same width side-on). Default build stays `medium`.

## 0.2.0

### Minor Changes

- a910296: Add a configurable `hairColor` (hair, beard and eyebrows), selectable from a
  natural hair-tone palette (`HAIRS`) with a HAIR swatch row in the editor and an
  enum in the demo's AI schema — no more hardcoded dark-brown hair.
- 3aac9af: Add a `receding` hairstyle — a short, combed-back cut with a receding hairline
  (front and profile views), for the classic short-business / "Geheimratsecken"
  look.
- e4b089b: Add a `shoes` part: sneakers, boots, dress-shoes, sandals, heels, rubber-boots,
  clown-shoes and barefoot — rendered in both front and profile views, with a
  matching editor control. Demonstrates that new parts append cleanly: existing
  seeds keep all their other parts (the shoe is the last seeded pick).
- 2692990: Make `AvatarConfig` fully string-based and English-keyed (breaking).

  Parts are now string ids (`hat: "top-hat"`, `mouth: "smile"`, …) instead of
  numeric indices, colours are hex strings (`skin: "#e0ac69"`), and keys are
  English: `hat, hair, ears, nose, mouth, top, trousers, build, accessory, skin,
topColor, trousersColor, background, view`. Drawing is dispatched by id, so adding or
  reordering a part option never breaks saved configs, share codes or rendering.

  - New: `PARTS`, `PART_LABELS`, `partIndex`, `partLabel`; colours accept any
    `#rrggbb`.
  - Removed: numeric config fields, `PART_NAMES`, `PART_IDS`, `toSerializable`,
    `fromSerializable`, `SerializedConfig`.
  - Share codes now contain the readable config object verbatim (old codes no
    longer decode).

- 545039a: `topColor` now tints the suit, robe and leather-jacket too (previously hardcoded
  navy / dark, ignoring the colour). Accent details stay fixed — the suit's white
  shirt and red tie, the jacket zipper — and the hi-vis vest keeps its safety
  orange. The default avatar's suit is now its `topColor` (blue) instead of navy.
- abd7126: Add a configurable `trousersColor` (any hex), decoupled from the trouser style,
  with a `TROUSERS` swatch row in the editor. Also fix the `barefoot` shoes option
  to actually show skin-coloured toes in both front and profile views.

  Rename the top colour field `clothing` → `topColor` for consistency with the
  style/colour pairs (`top`+`topColor`, `trousers`+`trousersColor`); `skin` and
  `background` stay suffix-free.

### Patch Changes

- 6a4a2e8: Make `hairColor` apply to the blow-wave and mohawk hairstyles too (they were
  hardcoded gold/red); all hairstyles now follow the configured hair colour.
- 6585ff3: Fix the mohawk in profile (left/right) views: it now renders as a spiky crest
  running front-to-back along the top of the head, instead of a small tuft at one
  edge.
- c2a9e0b: Add two bold "punk" hair colours to the `HAIRS` palette — red (`#e63946`) and
  green (`#06d6a0`) — great for mohawks. Available for all hairstyles and exposed
  to the demo's AI (red/green).
