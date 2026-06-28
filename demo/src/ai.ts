// Chrome built-in Prompt API (on-device Gemini Nano) → AvatarConfig.
// Experimental + Chrome-only; lives in the demo, not the library. Enable
// chrome://flags/#prompt-api-for-gemini-nano (+ the on-device model) to try it.
// Docs: https://developer.chrome.com/docs/ai/prompt-api
import { PARTS, PART_LABELS, SKIN, HAIRS, normalizeConfig, type AvatarConfig } from "@retro-antlitz-kartei/generator";

export type Availability = "unavailable" | "downloadable" | "downloading" | "available";

/* eslint-disable @typescript-eslint/no-explicit-any */
function getLM(): any | null {
  const g = globalThis as any;
  return g.LanguageModel ?? g.ai?.languageModel ?? null;
}

export function aiSupported(): boolean {
  return !!getLM();
}

export async function aiAvailability(): Promise<Availability> {
  const LM = getLM();
  if (!LM) return "unavailable";
  try {
    if (typeof LM.availability === "function") return await LM.availability();
    if (typeof LM.capabilities === "function") {
      const c = await LM.capabilities();
      return c?.available === "readily" ? "available" : c?.available === "after-download" ? "downloadable" : "unavailable";
    }
  } catch {
    /* ignore */
  }
  return "unavailable";
}

// Skin & hair are offered to the model as colour NAMES (it can't reliably map a
// word like "blonde" to a hex), then translated back to palette hex below. The
// other colours stay free-form hex so descriptions like "bright red coat" work.
const FREE_COLOR_KEYS = ["topColor", "trousersColor", "background"] as const;
const PART_KEYS = Object.keys(PARTS) as (keyof typeof PARTS)[];

const SKIN_BY_NAME: Record<string, string> = {
  pale: SKIN[0],
  fair: SKIN[1],
  tan: SKIN[2],
  brown: SKIN[3],
  dark: SKIN[4],
  golden: SKIN[5],
};
const HAIR_BY_NAME: Record<string, string> = {
  black: HAIRS[0],
  "dark-brown": HAIRS[1],
  brown: HAIRS[2],
  auburn: HAIRS[3],
  blonde: HAIRS[4],
  grey: HAIRS[5],
  white: HAIRS[6],
};

/** JSON schema for structured output — parts + skin/hair colour names are enums, other colours are hex. */
function buildSchema() {
  const properties: Record<string, unknown> = {};
  for (const k of PART_KEYS) properties[k] = { type: "string", enum: [...PARTS[k]] };
  properties.skin = { type: "string", enum: Object.keys(SKIN_BY_NAME), description: "skin tone" };
  properties.hairColor = { type: "string", enum: Object.keys(HAIR_BY_NAME), description: "hair/beard colour" };
  for (const c of FREE_COLOR_KEYS) properties[c] = { type: "string", description: "a #rrggbb hex colour" };
  properties.view = { type: "string", enum: ["front", "left", "right"] };
  return {
    type: "object",
    properties,
    required: [...PART_KEYS, "skin", "hairColor", ...FREE_COLOR_KEYS, "view"],
    additionalProperties: false,
  };
}

function systemPrompt(): string {
  const lines = PART_KEYS.map(
    (k) => `- ${k}: ${PARTS[k].map((id, i) => `${id} (${PART_LABELS[k][i]})`).join(", ")}`,
  );
  return [
    "You configure a retro pixel-art, full-body avatar from a short description.",
    "Pick, for each part, the id that best matches the description; if it isn't mentioned, choose a sensible, fitting option.",
    "Parts and their allowed ids (id (label)):",
    ...lines,
    `skin: choose one of ${Object.keys(SKIN_BY_NAME).join(", ")}.`,
    `hairColor: choose the hair/beard colour, one of ${Object.keys(HAIR_BY_NAME).join(", ")} — match the described hair (e.g. "blonde" → blonde, "grey" → grey).`,
    "Colours topColor (the top garment), trousersColor, background: return a #rrggbb hex matching any colour mentioned, otherwise a fitting one.",
    "build is the body size (small/medium/large). Set view to 'front' unless a side profile is requested.",
    "Respond with structured JSON only.",
  ].join("\n");
}

// Named colours for the free colour fields, so the model picks a word and we
// map to hex (the config accepts any hex, even outside the editor palette).
const NAMED_COLORS: Record<string, string> = {
  black: "#1c1c22",
  grey: "#9aa0a6",
  white: "#e8e8e8",
  navy: "#2b3a55",
  blue: "#3a86ff",
  red: "#e63946",
  green: "#2a9d8f",
  olive: "#5a6b4a",
  yellow: "#ffd60a",
  orange: "#f4a261",
  purple: "#9b5de5",
  pink: "#f15bb5",
  brown: "#6b4a2a",
  beige: "#c9a14a",
  cream: "#ffe0bd",
};

/** Per-field spec: the question label, allowed values, and optional name→hex map. */
interface FieldSpec {
  key: string;
  label: string;
  values: string[];
  map?: Record<string, string>;
}

function fieldSpecs(): FieldSpec[] {
  const specs: FieldSpec[] = PART_KEYS.map((k) => ({
    key: k,
    label: k,
    values: [...PARTS[k]],
  }));
  specs.push({ key: "skin", label: "skin tone", values: Object.keys(SKIN_BY_NAME), map: SKIN_BY_NAME });
  specs.push({ key: "hairColor", label: "hair and beard colour", values: Object.keys(HAIR_BY_NAME), map: HAIR_BY_NAME });
  specs.push({ key: "topColor", label: "top / jacket colour", values: Object.keys(NAMED_COLORS), map: NAMED_COLORS });
  specs.push({ key: "trousersColor", label: "trouser colour", values: Object.keys(NAMED_COLORS), map: NAMED_COLORS });
  specs.push({ key: "background", label: "background colour", values: Object.keys(NAMED_COLORS), map: NAMED_COLORS });
  return specs;
}

/** Run `fn` over `items` with at most `limit` in flight at once. */
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/**
 * Build a config straight from an image by asking the model **one focused
 * question per field** (each a single choice from that field's allowed values),
 * a few in parallel. Easier for the small on-device model than one big prompt.
 */
export async function configFromImage(
  image: Blob,
  onProgress?: (done: number, total: number) => void,
): Promise<AvatarConfig> {
  const LM = getLM();
  if (!LM) throw new Error("Prompt API not available in this browser.");
  const specs = fieldSpecs();
  let done = 0;
  const entries = await mapLimit(specs, 4, async (spec) => {
    try {
      const session: any = await LM.create({
        expectedInputs: [{ type: "image" }],
        initialPrompts: [{ role: "system", content: "You pick one cartoon-avatar attribute from a photo of a person." }],
      });
      try {
        const schema = {
          type: "object",
          properties: { value: { type: "string", enum: spec.values } },
          required: ["value"],
          additionalProperties: false,
        };
        const out = await session.prompt(
          [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  value: `Look at this person and choose the single best ${spec.label} for a cartoon avatar. Pick the closest match from the options.`,
                },
                { type: "image", value: image },
              ],
            },
          ],
          { responseConstraint: schema },
        );
        let v: string | undefined = JSON.parse(out).value;
        if (v != null && spec.map) v = spec.map[v] ?? v;
        return [spec.key, v] as const;
      } finally {
        session.destroy?.();
      }
    } catch {
      return [spec.key, undefined] as const; // fall back to default for this field
    } finally {
      onProgress?.(++done, specs.length);
    }
  });
  const data: Record<string, unknown> = {};
  for (const [k, v] of entries) if (v !== undefined) data[k] = v;
  return normalizeConfig(data as Partial<AvatarConfig>);
}

export async function createAiSession(onDownload?: (fraction: number) => void): Promise<unknown> {
  const LM = getLM();
  if (!LM) throw new Error("Prompt API not available in this browser.");
  return LM.create({
    initialPrompts: [{ role: "system", content: systemPrompt() }],
    monitor(m: any) {
      m?.addEventListener?.("downloadprogress", (e: any) => onDownload?.(e.loaded ?? 0));
    },
  });
}

/** Translate colour-name fields (skin, hairColor) back to palette hex. */
function translateColors(data: Record<string, unknown>): Record<string, unknown> {
  if (typeof data.skin === "string" && SKIN_BY_NAME[data.skin]) data.skin = SKIN_BY_NAME[data.skin];
  if (typeof data.hairColor === "string" && HAIR_BY_NAME[data.hairColor]) data.hairColor = HAIR_BY_NAME[data.hairColor];
  return data;
}

/** Prompt the model for a config and coerce it into a valid {@link AvatarConfig}. */
export async function configFromPrompt(session: any, description: string): Promise<AvatarConfig> {
  const schema = buildSchema();
  let text: string;
  try {
    text = await session.prompt(description, { responseConstraint: schema });
  } catch {
    text = await session.prompt(`${description}\n\nReturn only JSON for the avatar.`);
  }
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text);
  } catch {
    data = JSON.parse(text.replace(/```json|```/g, "").trim());
  }
  return normalizeConfig(translateColors(data) as Partial<AvatarConfig>);
}
