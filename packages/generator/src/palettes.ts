/**
 * The part catalog. Each key is a part of the figure; each array holds the
 * stable, ASCII, kebab-case option **ids** in render order (the index drives
 * the drawing code). These ids are the values stored in {@link AvatarConfig}
 * and written verbatim into share codes — rename labels freely, but never
 * reorder or rename an id without a migration.
 */
export const PARTS = {
  hat: ["none", "top-hat", "crown", "hard-hat", "peaked-cap", "tyrolean-hat", "pickelhaube", "halo"],
  hair: ["bald", "side-part", "tousled", "mullet", "blow-wave", "mohawk", "bun", "messy"],
  ears: ["normal", "sail-ears", "pointed", "small", "sticking-out", "floppy", "elf", "huge"],
  nose: ["button", "aquiline", "bulbous", "pointed", "wide", "hooked", "snub", "clown"],
  mouth: ["smile", "grimace", "pout", "grin", "scream", "line", "snarl", "whistle"],
  top: ["suit", "shirt", "uniform", "sweater", "hawaiian", "robe", "hi-vis-vest", "leather-jacket"],
  trousers: ["suit-trousers", "jeans", "cargo", "shorts", "bell-bottoms", "sweatpants", "lederhosen", "plaid"],
  build: ["small", "medium", "large"],
  accessory: ["none", "nerd-glasses", "round-glasses", "sunglasses", "monocle", "full-beard", "moustache", "goatee"],
  shoes: ["sneakers", "boots", "dress-shoes", "sandals", "heels", "rubber-boots", "clown-shoes", "none"],
} as const;

/** A part of the figure, e.g. `"hat"` or `"trousers"`. */
export type PartKey = keyof typeof PARTS;

/** A valid id for part `K`, e.g. `PartId<"hat">` is `"none" | "top-hat" | …`. */
export type PartId<K extends PartKey = PartKey> = (typeof PARTS)[K][number];

/** Human-readable display labels parallel to {@link PARTS}. UI-only. */
export const PART_LABELS: Record<PartKey, readonly string[]> = {
  hat: ["None", "Top Hat", "Crown", "Hard Hat", "Peaked Cap", "Tyrolean Hat", "Pickelhaube", "Halo"],
  hair: ["Bald", "Side Part", "Tousled", "Mullet", "Blow Wave", "Mohawk", "Bun", "Messy"],
  ears: ["Normal", "Sail Ears", "Pointed", "Small", "Sticking Out", "Floppy", "Elf", "Huge"],
  nose: ["Button", "Aquiline", "Bulbous", "Pointed", "Wide", "Hooked", "Snub", "Clown"],
  mouth: ["Smile", "Grimace", "Pout", "Grin", "Scream", "Line", "Snarl", "Whistle"],
  top: ["Suit", "Shirt", "Uniform", "Sweater", "Hawaiian", "Robe", "Hi-Vis Vest", "Leather Jacket"],
  trousers: ["Suit Trousers", "Jeans", "Cargo", "Shorts", "Bell-Bottoms", "Sweatpants", "Lederhosen", "Plaid"],
  build: ["Small", "Medium", "Large"],
  accessory: ["None", "Nerd Glasses", "Round Glasses", "Sunglasses", "Monocle", "Full Beard", "Moustache", "Goatee"],
  shoes: ["Sneakers", "Boots", "Dress Shoes", "Sandals", "Heels", "Rubber Boots", "Clown Shoes", "Barefoot"],
};

/** The render-order index of a part id, or `-1` if unknown. */
export function partIndex<K extends PartKey>(key: K, id: string): number {
  return (PARTS[key] as readonly string[]).indexOf(id);
}

/** The display label for a part id (falls back to the id itself). */
export function partLabel<K extends PartKey>(key: K, id: string): string {
  const i = partIndex(key, id);
  return i >= 0 ? PART_LABELS[key][i] : id;
}

/** Selectable skin tones (hex). The editor offers these; configs may use any hex. */
export const SKIN = ["#ffe0bd", "#f2c79a", "#e0ac69", "#c68642", "#8d5524", "#ff9d5c"] as const;

/** Selectable clothing colours (hex). */
export const CLOTH = ["#e63946", "#2a9d8f", "#3a86ff", "#f4a261", "#9b5de5", "#00bbf9", "#f15bb5", "#ffd60a"] as const;

/** Selectable background colours (hex). */
export const BG = ["#ff5d8f", "#3a86ff", "#06d6a0", "#ffd166", "#8338ec", "#fb5607", "#118ab2", "#2b2d42"] as const;

/** Selectable trouser colours (hex). The editor offers these; configs may use any hex. */
export const PANTS = ["#2b3a55", "#3a6ea5", "#5a6b4a", "#c9a14a", "#7a4a8a", "#9aa0a6", "#6b4a2a", "#b5563a"] as const;

/** The single hair colour used by all hairstyles and beards. */
export const HAIR = "#33240f";
