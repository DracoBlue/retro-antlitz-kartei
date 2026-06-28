---
"@retro-antlitz-kartei/generator": minor
"@retro-antlitz-kartei/react-editor": minor
"@retro-antlitz-kartei/animate": patch
---

Make `AvatarConfig` fully string-based and English-keyed (breaking).

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
