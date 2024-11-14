import type { Meta, StoryObj } from "@storybook/react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { CustomConfigStore } from "../../../components/configStore/customConfigStore";
import {
  SolflareWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import {
  Adapter,
  type WalletError,
  WalletAdapterNetwork,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";

import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  SolanaMobileWalletAdapter,
} from "@solana-mobile/wallet-adapter-mobile";
import { mainNavProps, sharePnLConfig } from "../trading/config.tsx";
import { TradingPage } from "@orderly.network/trading";
import { OrderlyIcon } from "../trading/icons.tsx";
import { useState } from "react";

const network = WalletAdapterNetwork.Devnet;

const mobileWalletNotFoundHanlder = (adapter: SolanaMobileWalletAdapter) => {
  console.log("-- mobile wallet adapter", adapter);

  return Promise.reject(new WalletNotReadyError("wallet not ready"));
};

const handleSolanaError = (error: WalletError, adapter?: Adapter) => {
  console.log("-- solanan error", error);
  console.log("-- solana adapter", adapter);
};

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new SolanaMobileWalletAdapter({
    addressSelector: createDefaultAddressSelector(),
    appIdentity: {
      uri: `${location.protocol}//${location.host}`,
    },
    authorizationResultCache: createDefaultAuthorizationResultCache(),
    chain: network,
    onWalletNotFound: mobileWalletNotFoundHanlder,
  }),
];

const meta: Meta<typeof TradingPage> = {
  title: "Package/solana/connect",
  component: TradingPage,
  decorators: [
    (Story) => {
      const configStore = new CustomConfigStore({
        networkId: "testnet",
        brokerId: "demo",
        brokerName: "Orderly",
        env: "staging",
      });
      console.log("-- wallets", wallets);
      return (
        <WalletConnectorProvider
          solanaInitial={{ wallets: wallets, onError: handleSolanaError }}
        >
          <OrderlyAppProvider configStore={configStore}>
            <Scaffold mainNavProps={mainNavProps}>
              <Story />
            </Scaffold>
          </OrderlyAppProvider>
        </WalletConnectorProvider>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {
    tradingViewConfig: {
      // scriptSRC: "",
      scriptSRC: "/tradingview/charting_library/charting_library.js",
      library_path: "/tradingview/charting_library/",
      customCssUrl: "/tradingview/chart.css",
    },
    sharePnLConfig,
    referral: {
      onClickReferral: () => {
        console.log("click referral");
      },
    },
    tradingRewards: {
      onClickTradingRewards: () => {
        console.log("click trading rewards");
      },
    },
    tabletMediaQuery: "(max-width: 768px)",
    bottomSheetLeading: <OrderlyIcon size={18} />,
    // bottomSheetLeading: "Orderly"
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (arg) => {
    const [symbol, setSymbol] = useState("PERP_BTC_USDC");

    return (
      <TradingPage
        {...arg}
        symbol={symbol}
        onSymbolChange={(symbol) => {
          setSymbol(symbol.symbol);
        }}
      />
    );
  },
};
