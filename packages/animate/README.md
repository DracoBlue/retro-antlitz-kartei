# @retro-antlitz-kartei/animate

Combat-arena **pose animation** for
[`@retro-antlitz-kartei/generator`](../generator) avatars: idle, walk, attack,
block, hit and win, drawn over a neon arena with shadows and particle effects.
MIT licensed.

```bash
pnpm add @retro-antlitz-kartei/animate @retro-antlitz-kartei/generator
```

## Usage

```ts
import { configFromSeed } from "@retro-antlitz-kartei/generator";
import { AvatarArena } from "@retro-antlitz-kartei/animate";

const arena = new AvatarArena(canvas); // starts the render loop
arena.setConfig(configFromSeed("Ada")); // composes a right-facing sprite
arena.setPose("attack");

// later
arena.stop();    // pause on the current frame
arena.destroy(); // stop and release the sprite
```

### Single frame (no loop)

```ts
import { composeSprite } from "@retro-antlitz-kartei/generator";
import { drawArenaFrame } from "@retro-antlitz-kartei/animate";

const sprite = composeSprite(config, "right");
drawArenaFrame(ctx, width, height, sprite, "win", elapsedSeconds);
```

## Use the poses in your own engine (PixiJS, Three, …)

The arena draws its own neon backdrop. If you already have a stage and a
background (e.g. a PixiJS combat scene), skip the backdrop and apply just the
**pose motion** to your sprite with `getPoseTransform`:

```ts
import { composeSprite, configFromSeed } from "@retro-antlitz-kartei/generator";
import { getPoseTransform } from "@retro-antlitz-kartei/animate";

// composeSprite returns a transparent canvas — a PixiJS texture, synchronously.
const tex = PIXI.Texture.from(composeSprite(configFromSeed("Ada"), "right"));
tex.source.scaleMode = "nearest"; // crisp pixels (Pixi v8)

app.ticker.add(() => {
  const { dx, dy, rot, sx, sy, flash } = getPoseTransform("hurt", t);
  sprite.x = baseX + dx; // dx/dy are tuned for a ~7× sprite — rescale if needed
  sprite.rotation = rot;
  sprite.scale.set(scale * sx, scale * sy);
  hitFlash.visible = flash; // your own flash + sound
});
```

A full runnable example (seeded avatar walking left→right, hit recoil + flash on
click) lives in [`examples/pixi.html`](../../examples/pixi.html).

## API

- `class AvatarArena(canvas, options?)` — owns a clock + `requestAnimationFrame`
  loop. `setPose`, `setSprite`, `setConfig`, `start`, `stop`, `renderOnce`,
  `destroy`; `pose` getter. Options: `pose`, `scale` (default 7), `background`,
  `sprite`, `autoStart`.
- `drawArenaFrame(ctx, w, h, sprite, pose, t, options?)` — stateless single
  frame; `t` is elapsed time in **seconds**.
- `getPoseTransform(pose, t)` → `{ dx, dy, rot, sx, sy, flash }` — the renderer-
  free pose motion, for driving sprites in any engine.
- `POSES`, `POSE_NAMES`, and the `Pose` type.

## License

[MIT](./LICENSE) © DracoBlue
