import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  type AvatarConfig,
  type PartKey,
  type View,
  PARTS,
  partLabel,
  SKIN,
  CLOTH,
  BG,
  PANTS,
  DEFAULT_CONFIG,
  normalizeConfig,
  encodeConfig,
  decodeConfig,
  randomConfig,
  configFromSeed,
} from "@retro-antlitz-kartei/generator";
import { AvatarPreview } from "./AvatarPreview.js";
import { CombatModal } from "./CombatModal.js";
import { theme, LAYOUTS, FONT_HREFS, type Layout } from "./theme.js";

export interface AvatarEditorProps {
  /** Controlled config. When set, you must update it via `onChange`. */
  value?: AvatarConfig;
  /** Initial config for uncontrolled use. */
  defaultValue?: AvatarConfig;
  /** Seed for the initial avatar when neither `value` nor `defaultValue` is given. */
  seed?: string;
  /** Called with the new config whenever the user edits the avatar. */
  onChange?: (config: AvatarConfig) => void;
  /** Controlled layout/skin. */
  layout?: Layout;
  /** Initial layout for uncontrolled use. Default `"arcade"`. */
  defaultLayout?: Layout;
  onLayoutChange?: (layout: Layout) => void;
  /** Show the layout switcher row. Default `true`. */
  showLayoutPicker?: boolean;
  /** Show the "fight" combat modal. Default `true`. */
  showCombat?: boolean;
  /** Show the share-code copy/load box. Default `true`. */
  showCode?: boolean;
  /** Show the seed input. Default `true`. */
  showSeed?: boolean;
  /** Inject the pixel web fonts (Press Start 2P + VT323) into `<head>`. Default `true`. */
  loadFonts?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const PART_CONTROLS: readonly { key: PartKey; label: string }[] = [
  { key: "build", label: "BUILD" },
  { key: "hat", label: "HAT" },
  { key: "hair", label: "HAIR" },
  { key: "ears", label: "EARS" },
  { key: "nose", label: "NOSE" },
  { key: "accessory", label: "ACCESSORY" },
  { key: "top", label: "TOP" },
  { key: "trousers", label: "TROUSERS" },
  { key: "shoes", label: "SHOES" },
];

const VIEW_OPTIONS: readonly { key: View; name: string }[] = [
  { key: "left", name: "LEFT" },
  { key: "front", name: "FRONT" },
  { key: "right", name: "RIGHT" },
];

/** Track whether an element is narrower than `breakpoint` px (for responsive layout). */
function useNarrow(ref: React.RefObject<HTMLElement | null>, breakpoint = 640): boolean {
  const [narrow, setNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint,
  );
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (w > 0) setNarrow(w < breakpoint);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, breakpoint]);
  return narrow;
}

function useControllable<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (v: T) => void,
): [T, (v: T) => void] {
  const [internal, setInternal] = useState<T>(initial);
  const value = controlled !== undefined ? controlled : internal;
  const set = useCallback(
    (v: T) => {
      if (controlled === undefined) setInternal(v);
      onChange?.(v);
    },
    [controlled, onChange],
  );
  return [value, set];
}

/**
 * The full retro avatar editor: live preview, part cyclers, colour swatches,
 * view + layout switchers, a shareable code box, a seed generator and the
 * animated combat modal. Works controlled (`value`/`onChange`) or uncontrolled.
 */
export function AvatarEditor(props: AvatarEditorProps): React.ReactElement {
  const {
    value,
    defaultValue,
    seed,
    onChange,
    layout: layoutProp,
    defaultLayout = "arcade",
    onLayoutChange,
    showLayoutPicker = true,
    showCombat = true,
    showCode = true,
    showSeed = true,
    loadFonts = true,
    className,
    style,
  } = props;

  const initialConfig = useMemo(
    () => normalizeConfig(value ?? defaultValue ?? (seed ? configFromSeed(seed) : DEFAULT_CONFIG)),
    // initial only
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [config, setConfig] = useControllable<AvatarConfig>(value, initialConfig, onChange);
  const [layout, setLayout] = useControllable<Layout>(layoutProp, defaultLayout, onLayoutChange);
  const [modalOpen, setModalOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeMsg, setCodeMsg] = useState("");
  const [seedInput, setSeedInput] = useState(seed ?? "");

  const stageRef = useRef<HTMLDivElement>(null);
  const narrow = useNarrow(stageRef);

  const t = theme(layout);
  const stacked = narrow || t.mainDir === "column";

  useEffect(() => {
    if (!loadFonts || typeof document === "undefined") return;
    for (const href of FONT_HREFS) {
      if (document.querySelector(`link[href="${href}"]`)) continue;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }, [loadFonts]);

  const patch = useCallback((p: Partial<AvatarConfig>) => setConfig({ ...config, ...p }), [config, setConfig]);
  const cycle = useCallback(
    (key: PartKey, dir: number) => {
      const ids = PARTS[key];
      const cur = ids.indexOf(config[key] as never);
      patch({ [key]: ids[(cur + dir + ids.length) % ids.length] } as Partial<AvatarConfig>);
    },
    [config, patch],
  );

  const onRandom = () => setConfig({ ...randomConfig(), view: config.view });
  const onCopyCode = () => {
    const code = encodeConfig(config);
    try {
      navigator.clipboard.writeText(code);
      setCodeMsg("Copied!");
    } catch {
      setCodeInput(code);
      setCodeMsg("Selected");
    }
  };
  const onLoadCode = () => {
    if (!codeInput.trim()) return;
    const next = decodeConfig(codeInput, config);
    setConfig(next);
    setCodeMsg("Loaded!");
  };
  const onGenerateSeed = () => {
    if (!seedInput.trim()) return;
    setConfig({ ...configFromSeed(seedInput), view: config.view });
  };

  /* ---------- styles ---------- */
  const arrowStyle: React.CSSProperties = {
    fontFamily: t.mono,
    fontSize: "10px",
    cursor: "pointer",
    flex: "0 0 auto",
    width: "32px",
    height: "32px",
    borderRadius: t.paper ? "3px" : "7px",
    border: "2px solid " + t.accent,
    background: t.glow ? t.accent : t.accent + "22",
    color: t.glow ? "#10131c" : t.accent,
    lineHeight: 1,
  };
  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: t.rowBg,
    borderRadius: t.paper ? "3px" : "8px",
    padding: "6px 8px",
    border: "1px solid " + t.panelBorder,
  };
  const partLabelStyle: React.CSSProperties = { fontFamily: t.mono, fontSize: "7px", color: t.sub, letterSpacing: "1px" };
  const partValueStyle: React.CSSProperties = { fontFamily: t.body, fontSize: "19px", color: t.text, lineHeight: 1.1, marginTop: "2px" };
  const dividerStyle: React.CSSProperties = { height: "2px", background: t.panelBorder, opacity: 0.6, margin: "2px 0" };
  const swatchRowStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" };
  const swatchLabelStyle: React.CSSProperties = { fontFamily: t.mono, fontSize: "7px", color: t.sub, letterSpacing: "1px", width: "78px", flex: "0 0 auto" };
  const codeFieldStyle: React.CSSProperties = {
    flex: "1 1 auto",
    minWidth: 0,
    fontFamily: "monospace",
    fontSize: "11px",
    padding: "7px 8px",
    borderRadius: t.paper ? "3px" : "6px",
    border: "2px solid " + t.panelBorder,
    background: t.paper ? "#fff" : "#0c111c",
    color: t.text,
    outline: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxSizing: "border-box",
  };
  const smallBtnStyle: React.CSSProperties = {
    fontFamily: t.mono,
    fontSize: "7px",
    letterSpacing: ".5px",
    cursor: "pointer",
    padding: "8px 9px",
    borderRadius: t.paper ? "3px" : "6px",
    border: "2px solid " + t.accent,
    background: t.glow ? t.accent : t.accent + "22",
    color: t.glow ? "#10131c" : t.accent,
    flex: "0 0 auto",
  };
  const codeLabelStyle: React.CSSProperties = { fontFamily: t.mono, fontSize: "7px", color: t.sub, letterSpacing: "1px" };
  const swatchBtn = (col: string, active: boolean): React.CSSProperties => ({
    background: col,
    width: "22px",
    height: "22px",
    cursor: "pointer",
    padding: 0,
    borderRadius: t.paper ? "2px" : "5px",
    border: "2px solid " + (active ? t.accent : t.paper ? "#00000033" : "#ffffff44"),
    boxShadow: active ? "0 0 0 2px " + t.accent + "66" : "none",
  });

  const nameDisplay = partLabel("top", config.top).toUpperCase();

  const partRow = (key: PartKey, label: string) => (
    <div key={key} style={rowStyle}>
      <button onClick={() => cycle(key, -1)} style={arrowStyle}>
        &#9664;
      </button>
      <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
        <div style={partLabelStyle}>{label}</div>
        <div style={partValueStyle}>{partLabel(key, config[key])}</div>
      </div>
      <button onClick={() => cycle(key, 1)} style={arrowStyle}>
        &#9654;
      </button>
    </div>
  );

  return (
    <div
      ref={stageRef}
      className={className}
      style={{
        minHeight: "100%",
        width: "100%",
        background: t.stageBg,
        padding: narrow ? "10px" : "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: t.body,
        backgroundImage: "radial-gradient(circle at 50% 0%, " + t.accent + "22, transparent 60%)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {showLayoutPicker && (
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "14px" }}>
          <span style={{ fontFamily: t.mono, fontSize: "9px", color: "#fff", opacity: 0.55, letterSpacing: "1px" }}>LAYOUT</span>
          {LAYOUTS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLayout(l.key)}
              style={{
                fontFamily: t.mono,
                fontSize: "8px",
                letterSpacing: "1px",
                cursor: "pointer",
                padding: "7px 9px",
                borderRadius: "6px",
                border: "2px solid " + (layout === l.key ? t.accent : "#ffffff22"),
                background: layout === l.key ? t.accent : "#ffffff10",
                color: layout === l.key ? "#10131c" : "#fff",
              }}
            >
              {l.name}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          width: "100%",
          maxWidth: narrow ? "100%" : t.mainDir === "row" ? "860px" : "540px",
          background: t.cabinet,
          border: narrow ? "none" : "4px solid " + t.cabinetBorder,
          borderRadius: narrow ? "10px" : t.radius,
          boxShadow: narrow ? "none" : "0 18px 50px rgba(0,0,0,.5)" + (t.glow ? ", 0 0 30px " + t.accent + "33" : ""),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: t.marqueeBg,
            padding: narrow ? "10px" : "14px",
            display: "flex",
            gap: narrow ? "8px" : "12px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            borderBottom: narrow ? "none" : "3px solid " + t.cabinetBorder,
          }}
        >
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.accent, boxShadow: "0 0 8px " + t.accent, flex: "0 0 auto" }} />
          <span
            style={{
              fontFamily: t.mono,
              fontSize: t.titleText === "WANTED" ? "20px" : narrow ? "10px" : "15px",
              color: t.title,
              letterSpacing: narrow ? "1px" : "2px",
              textShadow: t.glow ? "0 0 10px " + t.accent : "2px 2px 0 #00000044",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {t.titleText}
          </span>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.accent, boxShadow: "0 0 8px " + t.accent, flex: "0 0 auto" }} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: stacked ? "column" : "row",
            gap: "16px",
            padding: narrow ? "10px" : "18px",
            alignItems: stacked ? "center" : "stretch",
          }}
        >
          {/* screen card */}
          <div
            style={{
              flex: stacked ? "0 0 auto" : "0 0 300px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "center",
              width: stacked ? "100%" : undefined,
              maxWidth: "100%",
            }}
          >
            <div
              style={{
                position: "relative",
                padding: "10px",
                background: t.screenBg,
                borderRadius: t.paper ? "4px" : "10px",
                border: "4px solid " + t.cabinetBorder,
                boxShadow: "inset 0 0 20px rgba(0,0,0,.6)",
                cursor: showCombat ? "pointer" : "default",
              }}
              onClick={showCombat ? () => setModalOpen(true) : undefined}
            >
              <AvatarPreview
                config={config}
                width={320}
                height={400}
                style={{ width: "264px", maxWidth: "100%", height: "auto", aspectRatio: "320 / 400", borderRadius: "3px" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "10px",
                  pointerEvents: "none",
                  borderRadius: "3px",
                  backgroundImage: "repeating-linear-gradient(0deg, rgba(0,0,0,.16) 0 2px, transparent 2px 4px)",
                  mixBlendMode: "multiply",
                }}
              />
              {showCombat && (
                <div
                  style={{
                    position: "absolute",
                    right: "14px",
                    bottom: "14px",
                    fontFamily: t.mono,
                    fontSize: "7px",
                    letterSpacing: "1px",
                    color: t.title,
                    background: t.marqueeBg,
                    border: "2px solid " + t.cabinetBorder,
                    borderRadius: "6px",
                    padding: "5px 7px",
                    pointerEvents: "none",
                  }}
                >
                  &#9876; FIGHT
                </div>
              )}
            </div>
            <div
              style={{
                fontFamily: t.mono,
                fontSize: "9px",
                color: t.title,
                letterSpacing: "1px",
                padding: "6px 10px",
                background: t.marqueeBg,
                borderRadius: "5px",
                textAlign: "center",
                border: "2px solid " + t.cabinetBorder,
              }}
            >
              {"THE " + nameDisplay + " WEARER"}
            </div>

            <div style={{ width: "264px", maxWidth: "100%", display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>
              <div style={{ display: "flex", gap: "6px", width: "100%" }}>
                {VIEW_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => patch({ view: o.key })}
                    style={{
                      fontFamily: t.mono,
                      fontSize: "7px",
                      letterSpacing: ".5px",
                      cursor: "pointer",
                      flex: 1,
                      padding: "8px 4px",
                      borderRadius: t.paper ? "3px" : "6px",
                      border: "2px solid " + (config.view === o.key ? t.accent : t.panelBorder),
                      background: config.view === o.key ? t.accent : t.paper ? "#ffffff55" : "#ffffff10",
                      color: config.view === o.key ? "#10131c" : t.text,
                    }}
                  >
                    {o.name}
                  </button>
                ))}
              </div>

              {partRow("mouth", "MOUTH")}

              <div style={swatchRowStyle}>
                <span style={swatchLabelStyle}>BACKGROUND</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {BG.map((c) => (
                    <button key={c} onClick={() => patch({ background: c })} style={swatchBtn(c, config.background === c)} />
                  ))}
                </div>
              </div>

              {showCode && (
                <>
                  <div style={dividerStyle} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={codeLabelStyle}>CODE</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <div style={codeFieldStyle}>{encodeConfig(config)}</div>
                      <button onClick={onCopyCode} style={smallBtnStyle}>
                        COPY
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        value={codeInput}
                        onChange={(e) => {
                          setCodeInput(e.target.value);
                          setCodeMsg("");
                        }}
                        placeholder="Paste code…"
                        style={codeFieldStyle}
                      />
                      <button onClick={onLoadCode} style={smallBtnStyle}>
                        LOAD
                      </button>
                    </div>
                    {codeMsg && <span style={{ fontFamily: t.mono, fontSize: "7px", color: t.accent }}>{codeMsg}</span>}
                  </div>
                </>
              )}

              {showSeed && (
                <>
                  <div style={dividerStyle} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={codeLabelStyle}>SEED</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        value={seedInput}
                        onChange={(e) => setSeedInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") onGenerateSeed();
                        }}
                        placeholder="e.g. your name…"
                        style={codeFieldStyle}
                      />
                      <button onClick={onGenerateSeed} style={smallBtnStyle}>
                        GENERATE
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* controls card */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              width: stacked ? "100%" : "auto",
              display: "flex",
              flexDirection: "column",
              gap: "9px",
              background: t.panel,
              border: "3px solid " + t.panelBorder,
              borderRadius: t.paper ? "4px" : "10px",
              padding: "14px",
            }}
          >
            {PART_CONTROLS.map((c) => partRow(c.key, c.label))}

            <div style={dividerStyle} />

            <div style={swatchRowStyle}>
              <span style={swatchLabelStyle}>SKIN</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {SKIN.map((c) => (
                  <button key={c} onClick={() => patch({ skin: c })} style={swatchBtn(c, config.skin === c)} />
                ))}
              </div>
            </div>

            <div style={swatchRowStyle}>
              <span style={swatchLabelStyle}>CLOTHING</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {CLOTH.map((c) => (
                  <button key={c} onClick={() => patch({ topColor: c })} style={swatchBtn(c, config.topColor === c)} />
                ))}
              </div>
            </div>

            <div style={swatchRowStyle}>
              <span style={swatchLabelStyle}>TROUSERS</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {PANTS.map((c) => (
                  <button key={c} onClick={() => patch({ trousersColor: c })} style={swatchBtn(c, config.trousersColor === c)} />
                ))}
              </div>
            </div>

            <div style={dividerStyle} />

            <button
              onClick={onRandom}
              style={{
                fontFamily: t.mono,
                fontSize: "10px",
                letterSpacing: "1px",
                cursor: "pointer",
                padding: "12px",
                borderRadius: t.paper ? "3px" : "9px",
                marginTop: "2px",
                border: "3px solid " + t.title,
                background: t.accent,
                color: "#10131c",
              }}
            >
              &#127922; RANDOM
            </button>
          </div>
        </div>
      </div>

      {showCombat && modalOpen && <CombatModal config={config} theme={t} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
