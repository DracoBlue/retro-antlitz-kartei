import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works at any path — GitHub Pages serves project
// sites under /<repo>/, local preview under /.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
