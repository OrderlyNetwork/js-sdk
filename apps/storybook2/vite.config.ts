import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@orderly.network/chart": resolve(__dirname, "../../packages/chart/src"),
      "@orderly.network/portfolio": resolve(
        __dirname,
        "../../packages/portfolio/src"
      ),
      "@orderly.network/ui": resolve(__dirname, "../../packages/ui/src"),
    },
  },
});
