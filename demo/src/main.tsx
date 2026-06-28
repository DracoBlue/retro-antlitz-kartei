import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AvatarEditor } from "@retro-antlitz-kartei/react-editor";
import { configFromSeed, type AvatarConfig } from "@retro-antlitz-kartei/generator";
import { aiAvailability, createAiSession, configFromPrompt, configFromImage } from "./ai.js";

const REPO = "https://github.com/DracoBlue/retro-antlitz-kartei";

function MagicModal({ onConfig, onClose }: { onConfig: (cfg: AvatarConfig) => void; onClose: () => void }): React.ReactElement {
  const [desc, setDesc] = useState("a grumpy wizard with a long beard and a tall hat");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRef = useRef<any>(null);

  async function runPrompt(text: string) {
    if (!text.trim()) return;
    setStatus("Checking on-device model…");
    const avail = await aiAvailability();
    if (avail === "unavailable") {
      setStatus("Prompt API unavailable. Use Chrome and enable chrome://flags/#prompt-api-for-gemini-nano.");
      return;
    }
    if (!sessionRef.current) {
      if (avail !== "available") setStatus("Downloading the on-device model (one-time)…");
      sessionRef.current = await createAiSession((f) => setStatus(`Downloading model… ${Math.round(f * 100)}%`));
    }
    setStatus("Thinking…");
    onConfig(await configFromPrompt(sessionRef.current, text.trim()));
    setStatus("Configured from your description ✨");
  }

  async function generate() {
    if (busy || !desc.trim()) return;
    setBusy(true);
    try {
      await runPrompt(desc);
    } catch (e) {
      setStatus("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  async function handleImage(file: File) {
    if (busy) return;
    setBusy(true);
    setDesc("📷 " + file.name);
    try {
      setStatus("Reading the image…");
      const cfg = await configFromImage(file, (d, t) => setStatus(`Reading features… ${d}/${t}`));
      onConfig(cfg);
      setStatus("Configured from your image ✨");
    } catch (e) {
      setStatus("Image error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (file) handleImage(file);
    else setStatus("Drop an image file (PNG/JPG).");
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(8,4,16,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#15121f",
          border: "2px solid " + (dragOver ? "#ff5d8f" : "#3a3358"),
          borderRadius: "14px",
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          font: "13px ui-monospace, monospace",
          color: "#cdd6f4",
          boxShadow: "0 24px 70px rgba(0,0,0,.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#9b5de5", fontWeight: 700, fontSize: "15px" }}>&#10024; Magic avatar</span>
          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "7px",
              border: "1px solid #3a3358",
              background: "#1d1a2a",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            &#10005;
          </button>
        </div>

        <span style={{ color: "#8a93b2", fontSize: "12px" }}>Describe an avatar, or drop / paste a photo to recreate someone.</span>

        <input
          autoFocus
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") generate();
          }}
          onPaste={(e) => {
            const img = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
            if (img) {
              e.preventDefault();
              handleImage(img);
            }
          }}
          placeholder="describe, or drop / paste a photo…"
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid " + (dragOver ? "#ff5d8f" : "#3a3358"),
            background: dragOver ? "#241126" : "#0f0d18",
            color: "#fff",
            outline: "none",
            font: "inherit",
          }}
        />

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={generate}
            disabled={busy}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              background: busy ? "#5a3a55" : "#ff5d8f",
              color: "#10131c",
              fontWeight: 700,
              cursor: busy ? "default" : "pointer",
              font: "inherit",
            }}
          >
            {busy ? "…" : "Generate"}
          </button>
          {status && <span style={{ color: "#8a93b2", fontSize: "12px" }}>{status}</span>}
        </div>
      </div>
    </div>
  );
}

function App(): React.ReactElement {
  const [config, setConfig] = useState<AvatarConfig>(() => configFromSeed("Ada Lovelace"));
  const [aiOk, setAiOk] = useState(false);
  const [magicOpen, setMagicOpen] = useState(false);

  useEffect(() => {
    aiAvailability()
      .then((a) => setAiOk(a !== "unavailable"))
      .catch(() => setAiOk(false));
  }, []);

  return (
    <>
      <AvatarEditor
        value={config}
        onChange={setConfig}
        defaultLayout="kompakt"
        showLayoutPicker={false}
        onMagic={aiOk ? () => setMagicOpen(true) : undefined}
        style={{ paddingBottom: 40 }}
      />
      {magicOpen && (
        <MagicModal
          onConfig={(cfg) => setConfig({ ...cfg, view: config.view })}
          onClose={() => setMagicOpen(false)}
        />
      )}
      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "6px 10px",
          font: "11px ui-monospace, monospace",
          color: "#ffffff99",
          background: "#00000055",
          textAlign: "center",
        }}
      >
        <a href={REPO} target="_blank" rel="noreferrer" style={{ color: "#fff" }}>
          @retro-antlitz-kartei
        </a>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
