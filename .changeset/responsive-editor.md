---
"@retro-antlitz-kartei/react-editor": patch
---

Make the editor responsive: below ~640px (measured via `ResizeObserver`) it
drops the cabinet frame and stacks the preview above the controls edge-to-edge,
with a wrapping title and a fluid preview canvas — no more horizontal scrolling
on mobile. Wide viewports keep the framed side-by-side layout.
