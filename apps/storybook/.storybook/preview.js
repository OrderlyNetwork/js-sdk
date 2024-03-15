import { withThemeByDataAttribute } from "@storybook/addon-styling";
import { INITIAL_VIEWPORTS, MINIMAL_VIEWPORTS } from '@storybook/addon-viewport';
import { OrderlyAppProvider } from "@orderly.network/react";
import { MemoryConfigStore } from "@orderly.network/core";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
// import { ConnectorProvider } from "@orderly.network/web3-modal";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import { CustomContractManager } from "./CustomContract";
import { CustomConfigStore } from "./CustomConfigStore";

import "../src/tailwind.css"; // tailwind css

const apiKey = "a2c206fa-686c-466c-9046-433ea1bf5fa6";
const FujiRpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";
const INFURA_KEY = "3039f275d050427d8859a728ccd45e0c";

const wcV2InitOptions = {
  version: 2,
  projectId: "93dba83e8d9915dc6a65ffd3ecfd19fd",
  requiredChains: [42161],
  optionalChains: [421613, 42161],
  dappUrl: window.location.host,
};

const walletConnect = walletConnectModule(wcV2InitOptions);

const options = {
  wallets: [
    injectedModule(), // metamask
    walletConnect,
  ],
  appMetadata: {
    name: "Orderly",
    icon: "/OrderlyLogo.png",
    description: "Orderly",
    recommendedInjectedWallets: [
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "MetaMask", url: "https://metamask.io" },
      { name: "Trezor", url: "https://trezor.io/" },
      { name: "Walletconnect", url: "https://walletconnect.com/" },
      { name: "Ledger", url: "https://www.ledger.com/" },
    ],
    agreement: {
      version: "1.0.0",
      termsUrl: "https://www.blocknative.com/terms-conditions",
      privacyUrl: "https://www.blocknative.com/privacy-policy",
    },
    gettingStartedGuide: "https://blocknative.com",
    explore: "https://blocknative.com",
  },
  connect: {
    autoConnectLastWallet: true,
  },
};

const customViewports = {
  "iphone5 SE": {
    "name": "iPhone 5 320",
    "styles": {
      "height": "568px",
      "width": "320px"
    },
    "type": "mobile"
  },
  "iphone6 PRO": {
    "name": "SM 375",
    "styles": {
      "height": "667px",
      "width": "375px"
    },
    "type": "mobile"
  },
  "iphone6p PRO MAX": {
    "name": "MD 480",
    "styles": {
      "height": "853px",
      "width": "480px"
    },
    "type": "mobile"
  },
  "ipad": {
    "name": "LG 768",
    "styles": {
      "height": "1024px",
      "width": "768px"
    },
    "type": "tablet"
  },
  "ipad12p 1024": {
    "name": "XL 1024",
    "styles": {
      "height": "1366px",
      "width": "1024px"
    },
    "type": "tablet"
  },
  "1440": {
    "name": "2XL 1440",
    "styles": {
      "height": "1366px",
      "width": "1440px"
    },
    "type": "tablet"
  },
};

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
      viewports: {
        // ...INITIAL_VIEWPORTS,
        // ...MINIMAL_VIEWPORTS,
        ...customViewports,
      },
      defaultViewport: 'iphone6 PRO',
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
          { value: "PERP_BTC_USDC", title: "PERP_BTC_USDC" },
          { value: "PERP_TIA_USDC", title: "PERP_TIA_USDC" },
          { value: "PERP_AVAX_USDC", title: "PERP_AVAX_USDC" },
          { value: "PERP_WOO_USDC", title: "PERP_WOO_USDC" },
        ],
      },
    },
  },
  decorators: [
    (Story) => {
      // const networkId = localStorage.getItem("preview-orderly-networkId");
      // const networkId = "mainnet";
      const networkId = "testnet";
      const configStore = new CustomConfigStore({ networkId, env: "dev" });
      return (
        <ConnectorProvider options={options}>
          <OrderlyAppProvider
            networkId={networkId ?? "testnet"}
            brokerId="orderly"
            brokerName="Orderly"
            configStore={configStore}
            // contracts={new CustomContractManager(configStore)}
            appIcons={{
              main: {
                img: "/orderly-logo.svg",
              },
              secondary: {
                img: "/orderly-logo-secondary.svg",
              },
            }}
            footerStatusBarProps={{
              xUrl: "https://twitter.com/OrderlyNetwork",
              // telegramUrl: "https://orderly.network",
              discordUrl: "https://discord.com/invite/orderlynetwork",
            }}
            shareOptions={{
              pnl: {
                backgroundImages: [
                  "/images/poster_bg_1.png",
                  "/images/poster_bg_2.png",
                  "/images/poster_bg_3.png",
                  "/images/poster_bg_4.png",
                  "/images/poster_bg_5.png",
                ],
              },
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
        orderly: "",
        custom: "custom",
      },
      defaultTheme: "orderly",
      attributeName: "data-o-theme",
    }),
  ],
};

export default preview;
