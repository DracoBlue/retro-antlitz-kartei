# retro-antlitz-kartei

Retro **pixel-art, full-body avatars** — generate, animate and edit them. Pick
parts and colours like [avataaars](https://getavataaars.com/) or
[DiceBear](https://www.dicebear.com/), or derive a deterministic avatar from a
seed string. Every avatar is a tiny 32×40 sprite **with legs**, drawn to canvas
and scaled with crisp nearest-neighbour pixels.

> Satire Edition: top hats, crowns, halos, hi-vis vests, lederhosen, monocles
> and a neon combat arena.

![Seeded avatars](assets/seeds.png)

<sub>Deterministic from a seed — `configFromSeed("Ada")`, `configFromSeed("Bjarne")`, …</sub>

| Three views | Combat poses |
| --- | --- |
| ![left, front, right](assets/views.png) | ![idle, walk, attack, block, hit, win](assets/poses.png) |

## Packages

| Package | What it does |
| --- | --- |
| [`@retro-antlitz-kartei/generator`](packages/generator) | Framework-free core. Compose a sprite, render to canvas, encode/decode shareable codes, seed-based generation. |
| [`@retro-antlitz-kartei/animate`](packages/animate) | Combat-arena pose animation (idle, walk, attack, block, hit, win) over a generated sprite. |
| [`@retro-antlitz-kartei/react-editor`](packages/react-editor) | React `<AvatarEditor>` and `<AvatarPreview>` components — three retro themes, part cyclers, swatches, code box, seed input, combat modal. |

All packages are **MIT licensed** and ship ESM + CJS builds with type
definitions.

## Quick start

```bash
pnpm add @retro-antlitz-kartei/generator
```

```ts
import { configFromSeed, renderAvatar } from "@retro-antlitz-kartei/generator";

const canvas = document.querySelector("canvas")!;
renderAvatar(canvas, configFromSeed("Ada Lovelace"));
```

The same seed always produces the same avatar. Prefer hand-built configs? Use
`normalizeConfig`, `randomConfig`, or load a shared code with `decodeConfig`.

### React editor

```bash
pnpm add @retro-antlitz-kartei/react-editor react react-dom
```

```tsx
import { AvatarEditor } from "@retro-antlitz-kartei/react-editor";

export default () => <AvatarEditor seed="Ada" onChange={(cfg) => console.log(cfg)} />;
```

## Config & share codes

A config is a plain object of part choices and colours. Codes are base64 of a
**readable, string-valued** JSON form, so they stay valid even if catalogs are
reordered:

```json
{ "hut": "top-hat", "haare": "side-part", "nase": "button", "mund": "smile",
  "torso": "suit", "hose": "suit-trousers", "skin": "#e0ac69",
  "cloth": "#3a86ff", "bg": "#3a86ff", "gender": "medium", "acc": "none",
  "view": "front" }
```

`encodeConfig(config)` → code · `decodeConfig(code)` → config (invalid codes
fall back to the default avatar, never throw).

## Development

This is a [pnpm](https://pnpm.io) workspace.

```bash
pnpm install
pnpm build       # build every package
pnpm test        # run unit tests
pnpm typecheck   # type-check every package
node scripts/preview.mjs   # render sample PNGs to /tmp/rak-out (needs @napi-rs/canvas)
```

## Releasing

Versioning and publishing are automated with
[changesets](https://github.com/changesets/changesets).

1. With each change, add a changeset describing it:
   ```bash
   pnpm changeset   # pick packages + bump type, write a summary
   ```
2. On `main`, the **Release** workflow opens (or updates) a **Version Packages**
   PR that applies the version bumps and changelogs.
3. Merging that PR publishes the bumped packages to npm.

The first push to `main` with no pending changesets publishes the current
`0.1.0` of each package directly. Continuous **alpha** prereleases are available
via `pnpm changeset pre enter alpha`.

Requires an `NPM_TOKEN` repository secret (an npm automation token with publish
rights to the `@retro-antlitz-kartei` scope).

CI (build · typecheck · test) runs on every push and PR.

## License

[MIT](LICENSE) © DracoBlue
