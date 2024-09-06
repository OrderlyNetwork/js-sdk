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
      "@orderly.network/ui-transfer": resolve(
        __dirname,
        "../../packages/ui-transfer/src"
      ),
      "@orderly.network/ui-share": resolve(
        __dirname,
        "../../packages/ui-share/src"
      ),
      "@orderly.network/withdraw": resolve(
        __dirname,
        "../../packages/withdraw/src"
      ),
      "@orderly.network/trading": resolve(
        __dirname,
        "../../packages/trading/src"
      ),
      "@orderly.network/ui-chain-selector": resolve(
        __dirname,
        "../../packages/ui-chain-selector/src"
      ),
      // "@orderly.network/web3-onboard": resolve(
      //   __dirname,
      //   "../../packages/onboard/src"
      // ),
      "@orderly.network/ui-order-entry": resolve(
        __dirname,
        "../../packages/ui-order-entry/src"
      ),
      "@orderly.network/react/dist": resolve(
        __dirname,
        "../../packages/component/dist"
      ),
      
      "@orderly.network/react": resolve(
        __dirname,
        "../../packages/component/src"
      ),
      "@": resolve(__dirname, "../../packages/component/src")
    }
  }
});
