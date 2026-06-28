# @retro-antlitz-kartei/react-editor

React components for **retro pixel-art avatars**: a full editor with three retro
themes and a standalone preview. Built on
[`@retro-antlitz-kartei/generator`](../generator) and
[`@retro-antlitz-kartei/animate`](../animate). MIT licensed.

```bash
pnpm add @retro-antlitz-kartei/react-editor react react-dom
```

## Editor

```tsx
import { AvatarEditor } from "@retro-antlitz-kartei/react-editor";

// Uncontrolled, seeded initial avatar
<AvatarEditor seed="Ada" onChange={(cfg) => save(cfg)} />;

// Controlled
const [cfg, setCfg] = useState(() => normalizeConfig({ hat: "crown" }));
<AvatarEditor value={cfg} onChange={setCfg} defaultLayout="kompakt" />;
```

The editor renders a live preview, part cyclers, skin/clothing/background
swatches, a view switcher (left/front/right), a layout switcher
(arcade/compact/wanted), a shareable code box, a seed input, and a tap-to-open
**combat modal** with pose buttons.

### Props

| Prop | Default | Notes |
| --- | --- | --- |
| `value` / `defaultValue` | — | Controlled / uncontrolled config. |
| `seed` | — | Initial avatar from a seed when no value is given. |
| `onChange` | — | `(config) => void` on every edit. |
| `layout` / `defaultLayout` / `onLayoutChange` | `"arcade"` | `arcade` · `kompakt` · `steckbrief`. |
| `showLayoutPicker` `showCombat` `showCode` `showSeed` | `true` | Toggle chrome. |
| `loadFonts` | `true` | Inject Press Start 2P + VT323 into `<head>`. |
| `className` / `style` | — | On the outer stage. |

## Preview only

```tsx
import { AvatarPreview } from "@retro-antlitz-kartei/react-editor";

<AvatarPreview config={cfg} width={320} height={400} />;
```

Re-renders whenever `config` changes. `background` accepts `true` (palette),
a hex string, or `false` (transparent); `floor` toggles the ground strip.

Also exported: `CombatModal`, and the theme helpers `theme`, `LAYOUTS`,
`FONT_HREFS` with the `Layout` / `Theme` types.

## License

[MIT](./LICENSE) © DracoBlue
