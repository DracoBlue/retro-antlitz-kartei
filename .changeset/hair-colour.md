---
"@retro-antlitz-kartei/generator": minor
"@retro-antlitz-kartei/react-editor": patch
---

Add a configurable `hairColor` (hair, beard and eyebrows), selectable from a
natural hair-tone palette (`HAIRS`) with a HAIR swatch row in the editor — no
more hardcoded dark-brown hair. Internally, the build→head-shape variable was
renamed from the old gender-era `gx` ("m"/"w"/"n") to `frame`
("narrow"/"neutral"/"broad").
