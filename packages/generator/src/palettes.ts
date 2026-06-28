import type { PartKey } from "./types.js";

/**
 * Human-readable display labels for every catalogued part option. The array
 * index is the value stored in {@link AvatarConfig}. Use these for UI; use
 * {@link PART_IDS} for stable serialization.
 */
export const PART_NAMES: Record<PartKey, readonly string[]> = {
  hut: ["None", "Top Hat", "Crown", "Hard Hat", "Peaked Cap", "Tyrolean Hat", "Pickelhaube", "Halo"],
  haare: ["Bald", "Side Part", "Tousled", "Mullet", "Blow Wave", "Mohawk", "Bun", "Messy"],
  ohren: ["Normal", "Sail Ears", "Pointed", "Small", "Sticking Out", "Floppy", "Elf", "Huge"],
  nase: ["Button", "Aquiline", "Bulbous", "Pointed", "Wide", "Hooked", "Snub", "Clown"],
  mund: ["Smile", "Grimace", "Pout", "Grin", "Scream", "Line", "Snarl", "Whistle"],
  torso: ["Suit", "Shirt", "Uniform", "Sweater", "Hawaiian", "Robe", "Hi-Vis Vest", "Leather Jacket"],
  hose: ["Suit Trousers", "Jeans", "Cargo", "Shorts", "Bell-Bottoms", "Sweatpants", "Lederhosen", "Plaid"],
  gender: ["Small", "Medium", "Large"],
  acc: ["None", "Nerd Glasses", "Round Glasses", "Sunglasses", "Monocle", "Full Beard", "Moustache", "Goatee"],
};

/**
 * Stable, ASCII, kebab-case identifiers parallel to {@link PART_NAMES}. These
 * are what {@link encodeConfig} writes, so a code stays valid even if labels
 * are renamed, localized or reordered.
 */
export const PART_IDS: Record<PartKey, readonly string[]> = {
  hut: ["none", "top-hat", "crown", "hard-hat", "peaked-cap", "tyrolean-hat", "pickelhaube", "halo"],
  haare: ["bald", "side-part", "tousled", "mullet", "blow-wave", "mohawk", "bun", "messy"],
  ohren: ["normal", "sail-ears", "pointed", "small", "sticking-out", "floppy", "elf", "huge"],
  nase: ["button", "aquiline", "bulbous", "pointed", "wide", "hooked", "snub", "clown"],
  mund: ["smile", "grimace", "pout", "grin", "scream", "line", "snarl", "whistle"],
  torso: ["suit", "shirt", "uniform", "sweater", "hawaiian", "robe", "hi-vis-vest", "leather-jacket"],
  hose: ["suit-trousers", "jeans", "cargo", "shorts", "bell-bottoms", "sweatpants", "lederhosen", "plaid"],
  gender: ["small", "medium", "large"],
  acc: ["none", "nerd-glasses", "round-glasses", "sunglasses", "monocle", "full-beard", "moustache", "goatee"],
};

/** Selectable skin tones. Stored/serialized as the hex string. */
export const SKIN = ["#ffe0bd", "#f2c79a", "#e0ac69", "#c68642", "#8d5524", "#ff9d5c"] as const;

/** Selectable clothing colours. */
export const CLOTH = ["#e63946", "#2a9d8f", "#3a86ff", "#f4a261", "#9b5de5", "#00bbf9", "#f15bb5", "#ffd60a"] as const;

/** Selectable background colours. */
export const BG = ["#ff5d8f", "#3a86ff", "#06d6a0", "#ffd166", "#8338ec", "#fb5607", "#118ab2", "#2b2d42"] as const;

/** Trouser colours, indexed by the `hose` part value. */
export const PANTS = ["#2b3a55", "#3a6ea5", "#5a6b4a", "#c9a14a", "#7a4a8a", "#9aa0a6", "#6b4a2a", "#b5563a"] as const;

/** The single hair colour used by all hairstyles and beards. */
export const HAIR = "#33240f";
