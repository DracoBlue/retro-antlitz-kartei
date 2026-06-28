import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  type AvatarConfig,
  type PartKey,
  type View,
  PART_NAMES,
  SKIN,
  CLOTH,
  BG,
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
  { key: "gender", label: "BUILD" },
  { key: "hut", label: "HAT" },
  { key: "haare", label: "HAIR" },
  { key: "ohren", label: "EARS" },
  { key: "nase", label: "NOSE" },
  { key: "acc", label: "ACCESSORY" },
  { key: "torso", label: "TOP" },
  { key: "hose", label: "TROUSERS" },
];

const VIEW_OPTIONS: readonly { key: View; name: string }[] = [
  { key: "left", name: "LEFT" },
  { key: "front", name: "FRONT" },
  { key: "right", name: "RIGHT" },
];

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

  const t = theme(layout);

  useEffect(() => {
    if (!loadFonts || typeof document === "undefined") return;
    for (const href of FONT_HREFS) {
      if (document.querySelector(`link[href="${href}"]`)) continue;
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
    if (!document.getElementById("rak-keyframes")) {
      const s = document.createElement("style");
      s.id = "rak-keyframes";
      s.textContent = "@keyframes rak-coinpulse{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}";
      document.head.appendChild(s);
    }
  }, [loadFonts]);

  const patch = useCallback((p: Partial<AvatarConfig>) => setConfig({ ...config, ...p }), [config, setConfig]);
  const cycle = useCallback(
    (key: PartKey, dir: number) => {
      const len = PART_NAMES[key].length;
      patch({ [key]: (config[key] + dir + len) % len } as Partial<AvatarConfig>);
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

  const nameDisplay = PART_NAMES.torso[config.torso].toUpperCase();

  const partRow = (key: PartKey, label: string) => (
    <div key={key} style={rowStyle}>
      <button onClick={() => cycle(key, -1)} style={arrowStyle}>
        &#9664;
      </button>
      <div style={{ flex: 1, minWidth: 0, textAlign: "center" }}>
        <div style={partLabelStyle}>{label}</div>
        <div style={partValueStyle}>{PART_NAMES[key][config[key]]}</div>
      </div>
      <button onClick={() => cycle(key, 1)} style={arrowStyle}>
        &#9654;
      </button>
    </div>
  );

  return (
    <div
      className={className}
      style={{
        minHeight: "100%",
        width: "100%",
        background: t.stageBg,
        padding: "24px",
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
          maxWidth: t.mainDir === "row" ? "860px" : "540px",
          background: t.cabinet,
          border: "4px solid " + t.cabinetBorder,
          borderRadius: t.radius,
          boxShadow: "0 18px 50px rgba(0,0,0,.5)" + (t.glow ? ", 0 0 30px " + t.accent + "33" : ""),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: t.marqueeBg,
            padding: "14px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "3px solid " + t.cabinetBorder,
          }}
        >
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.accent, boxShadow: "0 0 8px " + t.accent }} />
          <span
            style={{
              fontFamily: t.mono,
              fontSize: t.titleText === "WANTED" ? "20px" : "15px",
              color: t.title,
              letterSpacing: "2px",
              textShadow: t.glow ? "0 0 10px " + t.accent : "2px 2px 0 #00000044",
            }}
          >
            {t.titleText}
          </span>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: t.accent, boxShadow: "0 0 8px " + t.accent }} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: t.mainDir,
            gap: "16px",
            padding: "18px",
            alignItems: t.mainDir === "row" ? "stretch" : "center",
          }}
        >
          {/* screen card */}
          <div
            style={{
              flex: t.mainDir === "row" ? "0 0 300px" : "0 0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              alignItems: "center",
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
              <AvatarPreview config={config} width={320} height={400} style={{ width: "264px", height: "330px", borderRadius: "3px" }} />
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

              {partRow("mund", "MOUTH")}

              <div style={swatchRowStyle}>
                <span style={swatchLabelStyle}>BACKGROUND</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {BG.map((c, i) => (
                    <button key={c} onClick={() => patch({ bg: i })} style={swatchBtn(c, config.bg === i)} />
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
              width: t.mainDir === "column" ? "100%" : "auto",
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
                {SKIN.map((c, i) => (
                  <button key={c} onClick={() => patch({ skin: i })} style={swatchBtn(c, config.skin === i)} />
                ))}
              </div>
            </div>

            <div style={swatchRowStyle}>
              <span style={swatchLabelStyle}>CLOTHING</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {CLOTH.map((c, i) => (
                  <button key={c} onClick={() => patch({ cloth: i })} style={swatchBtn(c, config.cloth === i)} />
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

        <div
          style={{
            background: t.marqueeBg,
            padding: "10px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            justifyContent: "center",
            color: t.title,
            borderTop: "3px solid " + t.cabinetBorder,
          }}
        >
          <span style={{ color: t.accent, fontSize: "14px", animation: "rak-coinpulse 1.2s ease-in-out infinite" }}>&#9679;</span>
          <span style={{ fontFamily: t.mono, fontSize: "8px", letterSpacing: "1px" }}>INSERT COIN &middot; SATIRE EDITION</span>
        </div>
      </div>

      {showCombat && modalOpen && <CombatModal config={config} theme={t} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
