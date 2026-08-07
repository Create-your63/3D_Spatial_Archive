import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === "true" ? "/3D_Spatial_Archive/" : "/",
  plugins: [react()],
});
