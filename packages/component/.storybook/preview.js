/** @type { import('@storybook/react').Preview } */
import { withThemeByDataAttribute } from "@storybook/addon-styling";
import { OrderlyAppProvider } from "../src";
import { MemoryConfigStore } from "@orderly.network/core";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
// import { ConnectorProvider } from "@orderly.network/web3-modal";
import { CustomContractManager } from "./CustomContract";
import { CustomConfigStore } from "./CustomConfigStore";
import "../src/tailwind.css"; // tailwind css

const apiKey = "a2c206fa-686c-466c-9046-433ea1bf5fa6";
const FujiRpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";
const INFURA_KEY = "3039f275d050427d8859a728ccd45e0c";

const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // viewport: {
    //   defaultViewport: "mobile2",
    // },
  },
  globalTypes: {
    symbol: {
      description: "Internationalization locale",
      defaultValue: "PERP_ETH_USDC",
      toolbar: {
        icon: "database",
        items: [
          { value: "PERP_ETH_USDC", title: "PERP_ETH_USDC" },
          { value: "PERP_NEAR_USDC", title: "PERP_NEAR_USDC" },
          { value: "PERP_BTC_USDC", title: "PERP_BTC_USDC" },
          { value: "PERP_TIA_USDC", title: "PERP_TIA_USDC" },
        ],
      },
    },
  },
  decorators: [
    (Story) => {
      const networkId = localStorage.getItem("preview-orderly-networkId");
      // const networkId = "mainnet";
      // const networkId = "testnet";
      const configStore = new CustomConfigStore({ networkId, env: "qa" });
      return (
        <ConnectorProvider projectId="cdb3af968143d40d27ad9b0b750dedb0">
          <OrderlyAppProvider
            networkId={networkId ?? "testnet"}
            brokerId="orderly"
            brokerName="Orderly"
            enableSwapDeposit={true}
            // configStore={configStore}
            // contracts={new CustomContractManager(configStore)}
            appIcons={{
              main: {
                img: "/orderly-logo.svg",
              },
              secondary: {
                img: "/orderly-logo-secondary.svg",
              },
            }}
            footerStatusBar={{
              xUrl: "https://twitter.com/OrderlyNetwork",
              // telegramUrl: "https://orderly.network",
              discordUrl: "https://discord.com/invite/orderlynetwork",
            }}
            onChainChanged={(networkId, isTestnet) => {
              console.log("network changed", networkId, isTestnet);
              localStorage.setItem(
                "preview-orderly-networkId",
                isTestnet ? "testnet" : "mainnet"
              );
              // realod page
              setTimeout(() => {
                window.location.reload();
              }, 100);
            }}
          >
            <Story />
          </OrderlyAppProvider>
        </ConnectorProvider>
      );
    },
    withThemeByDataAttribute({
      themes: {
        // light: "light",
        // dark: "dark",
        "woo/dark": "",
        "woo/light": "woo_light",
        orderly: "orderly",
      },
      defaultTheme: "woo/dark",
      attributeName: "data-o-theme",
    }),
  ],
};

export default preview;
