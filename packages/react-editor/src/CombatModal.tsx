import React, { useRef, useEffect, useState } from "react";
import type { AvatarConfig } from "@retro-antlitz-kartei/generator";
import { AvatarArena, POSES, POSE_NAMES, type Pose } from "@retro-antlitz-kartei/animate";
import type { Theme } from "./theme.js";

export interface CombatModalProps {
  config: AvatarConfig;
  theme: Theme;
  onClose: () => void;
}

/** Full-screen overlay running the animated combat arena with pose buttons. */
export function CombatModal({ config, theme: t, onClose }: CombatModalProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arenaRef = useRef<AvatarArena | null>(null);
  const [pose, setPose] = useState<Pose>("idle");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const arena = new AvatarArena(canvas, { pose: "idle" });
    arena.setConfig(config);
    arenaRef.current = arena;
    return () => arena.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    arenaRef.current?.setConfig(config);
  }, [config]);

  useEffect(() => {
    arenaRef.current?.setPose(pose);
  }, [pose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(8,4,16,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.cabinet,
          border: "4px solid " + t.cabinetBorder,
          borderRadius: t.paper ? "6px" : "14px",
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 20px 60px rgba(0,0,0,.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <span style={{ fontFamily: t.mono, fontSize: "10px", color: t.title, letterSpacing: "1px" }}>
            &#9876; COMBAT MODE
          </span>
          <button
            onClick={onClose}
            style={{
              fontFamily: t.mono,
              fontSize: "11px",
              cursor: "pointer",
              width: "30px",
              height: "30px",
              borderRadius: "7px",
              border: "2px solid " + t.panelBorder,
              background: "#ffffff10",
              color: "#fff",
              flex: "0 0 auto",
            }}
          >
            &#10005;
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width={360}
          height={380}
          style={{
            width: "100%",
            maxWidth: "360px",
            aspectRatio: "360 / 380",
            imageRendering: "pixelated",
            display: "block",
            margin: "0 auto",
            borderRadius: "8px",
            border: "3px solid " + t.cabinetBorder,
            background: "#0c0618",
          }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "7px" }}>
          {POSES.map((p) => (
            <button
              key={p}
              onClick={() => setPose(p)}
              style={{
                fontFamily: t.mono,
                fontSize: "7px",
                letterSpacing: ".5px",
                cursor: "pointer",
                padding: "10px 4px",
                borderRadius: "6px",
                border: "2px solid " + (pose === p ? "#00f0ff" : "#3a2f55"),
                background: pose === p ? "#00f0ff" : "#1c0d33",
                color: pose === p ? "#10131c" : "#cdbcff",
              }}
            >
              {POSE_NAMES[p].toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
