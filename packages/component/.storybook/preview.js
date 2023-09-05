/** @type { import('@storybook/react').Preview } */
import { withThemeByDataAttribute } from "@storybook/addon-styling";
import injectedModule from "@web3-onboard/injected-wallets";
import {
  Web3OnboardProvider,
  init,
  useConnectWallet,
} from "@web3-onboard/react";

import "../src/tailwind.css"; // tailwind css

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

const chains = [Arbitrum];
const wallets = [injectedModule()];
const web3Onboard = init({
  apiKey,
  connect: {
    autoConnectAllPreviousWallet: true,
  },
  wallets,
  chains,
  appMetadata: {
    name: "WooFi Dex",
    // icon: blocknativeIcon,
    description: "WooFi Dex",
    recommendedInjectedWallets: [
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "MetaMask", url: "https://metamask.io" },
    ],
    agreement: {
      version: "1.0.0",
      termsUrl: "https://www.blocknative.com/terms-conditions",
      privacyUrl: "https://www.blocknative.com/privacy-policy",
    },
    gettingStartedGuide: "https://blocknative.com",
    explore: "https://blocknative.com",
  },
  accountCenter: {
    desktop: {
        enabled: false,
    },
    mobile: {
        enabled: false,
    },
},
  theme: "dark",
});

const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    viewport: {
      defaultViewport: "mobile2",
    },
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
        ],
      },
    },
  },
};

export default preview;

export const decorators = [
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
];
