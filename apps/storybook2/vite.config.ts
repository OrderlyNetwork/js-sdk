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
      "@orderly.network/trading-rewards": resolve(
        __dirname,
        "../../packages/trading-rewards/src"
      ),
      "@orderly.network/markets": resolve(
        __dirname,
        "../../packages/markets/src"
      ),
      "@orderly.network/affiliate": resolve(
        __dirname,
        "../../packages/affiliate/src"
      ),
      "@orderly.network/ui": resolve(__dirname, "../../packages/ui/src"),
      "@orderly.network/hooks": resolve(__dirname, "../../packages/hooks/src"),
      "@orderly.network/utils": resolve(__dirname, "../../packages/utils/src"),
      "@orderly.network/react-app": resolve(
        __dirname,
        "../../packages/app/src"
      ),
      "@orderly.network/ui-connector": resolve(
        __dirname,
        "../../packages/ui-connector/src"
      ),
      "@orderly.network/ui-scaffold": resolve(
        __dirname,
        "../../packages/ui-scaffold/src"
      ),
      "@orderly.network/ui-leverage": resolve(
        __dirname,
        "../../packages/ui-leverage/src"
      ),
      "@orderly.network/ui-positions": resolve(
        __dirname,
        "../../packages/ui-positions/src"
      ),
      "@orderly.network/ui-orders": resolve(
        __dirname,
        "../../packages/ui-orders/src"
      ),
      "@orderly.network/deposit": resolve(
        __dirname,
        "../../packages/deposit/src"
      ),
      "@orderly.network/withdraw": resolve(
        __dirname,
        "../../packages/withdraw/src"
      ),
    },
  },
});
