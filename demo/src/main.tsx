import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { AvatarEditor } from "@retro-antlitz-kartei/react-editor";
import { encodeConfig, type AvatarConfig } from "@retro-antlitz-kartei/generator";

function App(): React.ReactElement {
  const [code, setCode] = useState<string>("");
  const onChange = (cfg: AvatarConfig) => setCode(encodeConfig(cfg));
  return (
    <>
      <AvatarEditor seed="Ada Lovelace" onChange={onChange} />
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
          pointerEvents: "none",
        }}
      >
        @retro-antlitz-kartei — last config code: <span style={{ color: "#fff" }}>{code || "(edit to generate)"}</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
