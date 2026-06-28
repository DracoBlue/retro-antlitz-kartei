/** The three editor skins. */
export type Layout = "arcade" | "kompakt" | "steckbrief";

/** All layouts in display order. */
export const LAYOUTS: readonly { key: Layout; name: string }[] = [
  { key: "arcade", name: "ARCADE" },
  { key: "kompakt", name: "COMPACT" },
  { key: "steckbrief", name: "WANTED" },
];

/** Resolved style tokens for a layout — colours, fonts and shape. */
export interface Theme {
  stageBg: string;
  cabinet: string;
  cabinetBorder: string;
  marqueeBg: string;
  title: string;
  accent: string;
  screenBg: string;
  panel: string;
  panelBorder: string;
  rowBg: string;
  text: string;
  sub: string;
  mainDir: "row" | "column";
  mono: string;
  body: string;
  radius: string;
  titleText: string;
  glow: boolean;
  paper: boolean;
}

const MONO = "'Press Start 2P',monospace";
const BODY = "'VT323',monospace";

/** Resolve the visual tokens for a layout. */
export function theme(layout: Layout): Theme {
  if (layout === "kompakt") {
    return {
      stageBg: "#10131c",
      cabinet: "#1a1f2e",
      cabinetBorder: "#2a3145",
      marqueeBg: "#232a3d",
      title: "#7df9ff",
      accent: "#ff5d8f",
      screenBg: "#0b0e16",
      panel: "#222a3d",
      panelBorder: "#323b54",
      rowBg: "#1a2032",
      text: "#cdd6f4",
      sub: "#8a93b2",
      mainDir: "row",
      mono: MONO,
      body: BODY,
      radius: "14px",
      titleText: "AVATAR EDITOR",
      glow: false,
      paper: false,
    };
  }
  if (layout === "steckbrief") {
    return {
      stageBg: "#3a2a18",
      cabinet: "#efe2c4",
      cabinetBorder: "#7a5a32",
      marqueeBg: "#c0392b",
      title: "#fff4dc",
      accent: "#c0392b",
      screenBg: "#d8c9a6",
      panel: "#e6d8ba",
      panelBorder: "#b89a64",
      rowBg: "#f3ead2",
      text: "#4a3520",
      sub: "#8a6e44",
      mainDir: "row",
      mono: MONO,
      body: BODY,
      radius: "4px",
      titleText: "WANTED",
      glow: false,
      paper: true,
    };
  }
  return {
    // arcade
    stageBg: "#1a0b2e",
    cabinet: "#3a1d5c",
    cabinetBorder: "#ff2e88",
    marqueeBg: "#120726",
    title: "#ffe600",
    accent: "#00f0ff",
    screenBg: "#06010f",
    panel: "#2a1248",
    panelBorder: "#7b2ff7",
    rowBg: "#1c0d33",
    text: "#ffe600",
    sub: "#b48cff",
    mainDir: "column",
    mono: MONO,
    body: BODY,
    radius: "10px",
    titleText: "AVATAR-O-MAT",
    glow: true,
    paper: false,
  };
}

/** The web-font `<link>` hrefs the editor needs (Press Start 2P + VT323). */
export const FONT_HREFS: readonly string[] = [
  "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap",
];
