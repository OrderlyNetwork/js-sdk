/** @type { import('@storybook/react').Preview } */
import { withThemeByDataAttribute } from "@storybook/addon-styling";
import { OrderlyAppProvider } from "../src";
import { MemoryConfigStore } from "@orderly.network/core";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
// import { ConnectorProvider } from "@orderly.network/web3-modal";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import { CustomContractManager } from "./CustomContract";
import { CustomConfigStore } from "./CustomConfigStore";
import "../src/tailwind.css"; // tailwind css

const wcV2InitOptions = {
  version: 2,
  projectId: "e2df8a7d186b83f3027973333f4c72b9",
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
          { value: "PERP_AVAX_USDC", title: "PERP_AVAX_USDC" },
          { value: "PERP_WOO_USDC", title: "PERP_WOO_USDC" },
          { value: "PERP_JUP_USDC", title: "PERP_JUP_USDC" },
        ],
      },
    },
  },
  decorators: [
    (Story) => {
      // const networkId = localStorage.getItem("preview-orderly-networkId");
      // const networkId = "mainnet";
      const networkId = "testnet";
      const configStore = new CustomConfigStore({ networkId, env: "qa" });

      const searchParams = new URLSearchParams(window.location.search);
    const refCode = searchParams.get('ref');
    console.log("ref code is", refCode);

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
                // color: "rgba(255, 255, 255, 0.98)",
                // profitColor: "rgb(255,0,0)",
                // lossColor: "rgb(0,0,255)",
                // brandColor: "rgb(0,181,159)",
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
            onClickReferral={() => {
              console.log("click referral");
            }}
            onBoundRefCode={(success, error) => {
              console.log("on bound ref code", success, error);
              
            }}
            saveRefCode
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
