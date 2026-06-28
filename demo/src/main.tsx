import React, { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AvatarEditor } from "@retro-antlitz-kartei/react-editor";
import { configFromSeed, type AvatarConfig } from "@retro-antlitz-kartei/generator";
import { aiAvailability, createAiSession, configFromPrompt } from "./ai.js";

const REPO = "https://github.com/DracoBlue/retro-antlitz-kartei";

function PromptBar({ onConfig }: { onConfig: (cfg: AvatarConfig) => void }): React.ReactElement {
  const [desc, setDesc] = useState("a grumpy wizard with a long beard and a tall hat");
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRef = useRef<any>(null);

  async function generate() {
    if (busy || !desc.trim()) return;
    setBusy(true);
    setStatus("Checking on-device model…");
    try {
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
      const cfg = await configFromPrompt(sessionRef.current, desc.trim());
      onConfig(cfg);
      setStatus("Configured from your description ✨");
    } catch (e) {
      setStatus("Error: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center",
        padding: "10px 12px",
        background: "#0d0a16",
        borderBottom: "1px solid #2a2340",
        font: "13px ui-monospace, monospace",
        color: "#cdd6f4",
      }}
    >
      <span style={{ color: "#ff5d8f", fontWeight: 700 }}>✦ describe your avatar:</span>
      <input
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") generate();
        }}
        placeholder="e.g. a punk in a leather jacket and red mohawk"
        style={{
          flex: "1 1 280px",
          minWidth: 0,
          padding: "8px 10px",
          borderRadius: "8px",
          border: "1px solid #3a3358",
          background: "#15121f",
          color: "#fff",
          outline: "none",
          font: "inherit",
        }}
      />
      <button
        onClick={generate}
        disabled={busy}
        style={{
          padding: "8px 14px",
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
      {status && <span style={{ flexBasis: "100%", color: "#8a93b2", fontSize: "12px" }}>{status}</span>}
    </div>
  );
}

function App(): React.ReactElement {
  const [config, setConfig] = useState<AvatarConfig>(() => configFromSeed("Ada Lovelace"));

  return (
    <>
      <PromptBar onConfig={(cfg) => setConfig({ ...cfg, view: config.view })} />
      <AvatarEditor
        value={config}
        onChange={setConfig}
        defaultLayout="kompakt"
        showLayoutPicker={false}
        style={{ paddingBottom: 40 }}
      />
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
