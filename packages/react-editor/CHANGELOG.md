# @retro-antlitz-kartei/react-editor

## 0.2.0

### Minor Changes

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

### Patch Changes

- 61dcfd3: Trim the editor chrome: remove the "INSERT COIN · SATIRE EDITION" footer and
  prefix the compact layout's marquee title with the package name
  ("@retro-antlitz-kartei AVATAR EDITOR").
- a910296: Add a configurable `hairColor` (hair, beard and eyebrows), selectable from a
  natural hair-tone palette (`HAIRS`) with a HAIR swatch row in the editor and an
  enum in the demo's AI schema — no more hardcoded dark-brown hair.
- 40dc886: Add an optional `onMagic` prop to `AvatarEditor`. When provided, a "✨ MAGIC"
  button is rendered next to RANDOM (e.g. to open a custom prompt/AI modal) — the
  editor itself stays dependency-free.
- 3aac9af: Add a `receding` hairstyle — a short, combed-back cut with a receding hairline
  (front and profile views), for the classic short-business / "Geheimratsecken"
  look.
- cf3a461: Make the editor responsive: below ~640px (measured via `ResizeObserver`) it
  drops the cabinet frame and stacks the preview above the controls edge-to-edge,
  with a wrapping title and a fluid preview canvas — no more horizontal scrolling
  on mobile. Wide viewports keep the framed side-by-side layout.
- e4b089b: Add a `shoes` part: sneakers, boots, dress-shoes, sandals, heels, rubber-boots,
  clown-shoes and barefoot — rendered in both front and profile views, with a
  matching editor control. Demonstrates that new parts append cleanly: existing
  seeds keep all their other parts (the shoe is the last seeded pick).
- abd7126: Add a configurable `trousersColor` (any hex), decoupled from the trouser style,
  with a `TROUSERS` swatch row in the editor. Also fix the `barefoot` shoes option
  to actually show skin-coloured toes in both front and profile views.

  Rename the top colour field `clothing` → `topColor` for consistency with the
  style/colour pairs (`top`+`topColor`, `trousers`+`trousersColor`); `skin` and
  `background` stay suffix-free.

- Updated dependencies [6a4a2e8]
- Updated dependencies [a910296]
- Updated dependencies [6585ff3]
- Updated dependencies [c2a9e0b]
- Updated dependencies [3aac9af]
- Updated dependencies [e4b089b]
- Updated dependencies [2692990]
- Updated dependencies [545039a]
- Updated dependencies [abd7126]
  - @retro-antlitz-kartei/generator@0.2.0
  - @retro-antlitz-kartei/animate@0.1.1
