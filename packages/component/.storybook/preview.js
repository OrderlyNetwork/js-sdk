/** @type { import('@storybook/react').Preview } */
import { withThemeByDataAttribute } from "@storybook/addon-styling";
import injectedModule from "@web3-onboard/injected-wallets";
import {
  Web3OnboardProvider,
  init,
  useConnectWallet,
} from "@web3-onboard/react";
import { OnboardConnectorProvider, OrderlyProvider,OrderlyAppProvider } from "../src";
import {
  BaseContractManager,
  EtherAdapter,
  LocalStorageStore,
  MemoryConfigStore,
} from "@orderly.network/core";

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
          { value: "PERP_BTC_USDC", title: "PERP_BTC_USDC" },
        ],
      },
    },
  },
  decorators: [
    (Story) => {
     
      return (
        <OnboardConnectorProvider>
          <OrderlyAppProvider
            networkId="mainnet"
            brokerId="woofi_pro"
            onlyTestnet={false}
       
            logoUrl="/woo_fi_logo.svg"
          >
            <Story />
          </OrderlyAppProvider>
        </OnboardConnectorProvider>
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

