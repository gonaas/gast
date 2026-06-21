import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Alias "@/..." -> src/...  (sin import de node para no depender de @types/node).
    alias: { "@": new URL("./src", import.meta.url).pathname },
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
});
