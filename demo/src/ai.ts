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

// Skin is constrained to the natural skin-tone palette; the other colours stay
// free-form hex so descriptions like "bright red coat" work.
const FREE_COLOR_KEYS = ["topColor", "trousersColor", "background"] as const;
const PART_KEYS = Object.keys(PARTS) as (keyof typeof PARTS)[];

/** JSON schema for structured output — parts + skin are enums, other colours are hex. */
function buildSchema() {
  const properties: Record<string, unknown> = {};
  for (const k of PART_KEYS) properties[k] = { type: "string", enum: [...PARTS[k]] };
  properties.skin = { type: "string", enum: [...SKIN], description: "skin tone" };
  properties.hairColor = { type: "string", enum: [...HAIRS], description: "natural hair colour" };
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
    "skin and hairColor: pick the closest natural tone from the allowed values (a hex from the palette) — never an unnatural colour. Match hairColor to any described hair colour (e.g. blonde, grey, black).",
    "Colours topColor (the top garment), trousersColor, background: return a #rrggbb hex matching any colour mentioned, otherwise a fitting one.",
    "build is the body size (small/medium/large). Set view to 'front' unless a side profile is requested.",
    "Respond with structured JSON only.",
  ].join("\n");
}

/** Whether the on-device model accepts image input (multimodal Prompt API). */
export async function imageSupported(): Promise<boolean> {
  const LM = getLM();
  if (!LM) return false;
  try {
    const a = await LM.availability({ expectedInputs: [{ type: "image" }] });
    return a !== "unavailable";
  } catch {
    return false;
  }
}

/** Describe a person in an image as a one-line avatar prompt (multimodal). */
export async function describeImage(image: Blob): Promise<string> {
  const LM = getLM();
  if (!LM) throw new Error("Prompt API not available in this browser.");
  const session: any = await LM.create({
    expectedInputs: [{ type: "image" }],
    initialPrompts: [{ role: "system", content: "You turn a photo of a person into a short avatar description." }],
  });
  try {
    const out = await session.prompt([
      {
        role: "user",
        content: [
          {
            type: "text",
            value:
              "In ONE short English sentence, describe this person for a cartoon avatar: hairstyle & hair colour, facial hair, glasses, any hat, the top/clothing, and overall build. No preamble.",
          },
          { type: "image", value: image },
        ],
      },
    ]);
    return String(out).replace(/\s+/g, " ").trim();
  } finally {
    session.destroy?.();
  }
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

/** Prompt the model for a config and coerce it into a valid {@link AvatarConfig}. */
export async function configFromPrompt(session: any, description: string): Promise<AvatarConfig> {
  const schema = buildSchema();
  let text: string;
  try {
    text = await session.prompt(description, { responseConstraint: schema });
  } catch {
    text = await session.prompt(`${description}\n\nReturn only JSON for the avatar.`);
  }
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = JSON.parse(text.replace(/```json|```/g, "").trim());
  }
  return normalizeConfig(data as Partial<AvatarConfig>);
}
