import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyAppProvider, TradingPage } from "@orderly.network/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";

interface Props {
  onSymbolChange: (symbol: string) => void;
  symbol: string;
}

const tradingViewConfig: any = {
  scriptSRC: "/tradingview/charting_library/charting_library.js",
  library_path: "/tradingview/charting_library/",
  overrides: {
    "paneProperties.backgroundType": "solid",
    "paneProperties.background": "#1D1A26",

    "mainSeriesProperties.candleStyle.upColor": "#00B59F",
    "mainSeriesProperties.candleStyle.downColor": "#FF67C2",
    "mainSeriesProperties.candleStyle.borderColor": "#00B59F",
    "mainSeriesProperties.candleStyle.borderUpColor": "#00B59F",
    "mainSeriesProperties.candleStyle.borderDownColor": "#FF67C2",
    "mainSeriesProperties.candleStyle.wickUpColor": "#00B59F",
    "mainSeriesProperties.candleStyle.wickDownColor": "#FF67C2",

    // GRID lines
    "paneProperties.vertGridProperties.color": "#26232F",
    "paneProperties.horzGridProperties.color": "#26232F",

    // text color
    "scalesProperties.textColor": "#97969B",
    "scalesProperties.lineColor": "#2B2833",
  },
};

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
    // autoConnectLastWallet: true,
  },
};

const View = (props: Props) => {
  const networkId = localStorage.getItem("orderly-networkId") ?? "mainnet";

  return (
    <ConnectorProvider options={options}>
      <OrderlyAppProvider
        networkId={networkId}
        brokerId="orderly"
        onlyTestnet={false}
        logoUrl="/orderly_logo.svg"
        onChainChanged={(chainId, isTestnet) => {
          // console.log('chain changed', chainId, isTestnet);
          localStorage.setItem(
            "orderly-networkId",
            isTestnet ? "testnet" : "mainnet"
          );
          // realod page
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }}
      >
        <TradingPage
          symbol={props.symbol}
          onSymbolChange={props.onSymbolChange}
          tradingViewConfig={tradingViewConfig}
        />
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
};

export default View;
