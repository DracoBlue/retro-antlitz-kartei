# @retro-antlitz-kartei/animate

## 0.1.1

### Patch Changes

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
