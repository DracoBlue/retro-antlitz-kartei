---
"@retro-antlitz-kartei/generator": minor
"@retro-antlitz-kartei/react-editor": patch
---

Add a configurable `trousersColor` (any hex), decoupled from the trouser style,
with a `TROUSERS` swatch row in the editor. Also fix the `barefoot` shoes option
to actually show skin-coloured toes in both front and profile views.

Rename the top colour field `clothing` → `topColor` for consistency with the
style/colour pairs (`top`+`topColor`, `trousers`+`trousersColor`); `skin` and
`background` stay suffix-free.
