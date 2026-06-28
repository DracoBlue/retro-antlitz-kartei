import React from "react";
import { createRoot } from "react-dom/client";
import { AvatarEditor } from "@retro-antlitz-kartei/react-editor";

const REPO = "https://github.com/DracoBlue/retro-antlitz-kartei";

function App(): React.ReactElement {
  return (
    <>
      <AvatarEditor seed="Ada Lovelace" defaultLayout="kompakt" showLayoutPicker={false} />
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
