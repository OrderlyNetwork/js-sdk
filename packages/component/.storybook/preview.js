/** @type { import('@storybook/react').Preview } */
import { withThemeByDataAttribute } from "@storybook/addon-styling";
import injectedModule from "@web3-onboard/injected-wallets";

import { OrderlyAppProvider } from "../src";

import { MemoryConfigStore } from "@orderly.network/core";

import { ConnectorProvider } from "@orderly.network/web3-onboard";

import "../src/tailwind.css"; // tailwind css
import chains from "./chains";

const apiKey = "a2c206fa-686c-466c-9046-433ea1bf5fa6";

// const rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`
const FujiRpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";
const INFURA_KEY = "3039f275d050427d8859a728ccd45e0c";

const Arbitrum = {
  id: 421613,
  // chainId: '421613',
  label: "Arbitrum Goerli",
  token: "AGOR",
  rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
};

// const chains = [
//   Arbitrum,
//   //   {
//   //   id: 97,
//   // label:'BNB Chain Testnet',
//   // token:'BNB',
//   // rpcUrl:'https://data-seed-prebsc-1-s1.binance.org:8545'
//   // }
//   {
//     id: 43113,
//     // label:'BNB Chain Testnet',
//     // token:'BNB',
//     // rpcUrl:'https://data-seed-prebsc-1-s1.binance.org:8545'
//   },
//   {
//     id: 84531,
//     label: "Base Goerli Testnet",
//     token: "ETH",
//     rpcUrl: "https://goerli.basescan.org",
//   },
// ];

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
        ],
      },
    },
  },
  decorators: [
    (Story) => {
      return (
        <ConnectorProvider>
          <OrderlyAppProvider
            networkId="testnet"
            brokerId="woofi_pro"
            onlyTestnet={false}
            // showTestnet={true}
            logoUrl="/woo_fi_logo.svg"
            onChainChanged={(networkId, isTestnet) => {
              console.log("network changed", networkId, isTestnet);
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
