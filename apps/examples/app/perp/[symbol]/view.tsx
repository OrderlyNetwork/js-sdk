import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyAppProvider, TradingPage } from "@orderly.network/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";
import ledgerModule from "@web3-onboard/ledger";

interface Props {
  onSymbolChange: (symbol: string) => void;
  symbol: string;
}

const orderlyOverrides = {
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
};

const customOverrides = {
  // "paneProperties.background": "#ffffff",
  // "mainSeriesProperties.style": 1,
  "paneProperties.backgroundType": "solid",
  "paneProperties.background": "#151822",

  "mainSeriesProperties.candleStyle.upColor": "#439687",
  "mainSeriesProperties.candleStyle.downColor": "#DE5E57",
  "mainSeriesProperties.candleStyle.borderColor": "#378658",
  "mainSeriesProperties.candleStyle.borderUpColor": "#439687",
  "mainSeriesProperties.candleStyle.borderDownColor": "#DE5E57",
  "mainSeriesProperties.candleStyle.wickUpColor": "#439687",
  "mainSeriesProperties.candleStyle.wickDownColor": "#DE5E57",
};

const tradingViewConfig: any = {
  scriptSRC: "/tradingview/charting_library/charting_library.js",
  library_path: "/tradingview/charting_library/",
  overrides: customOverrides,
  // overrides: orderlyOverrides,
};

const View = (props: Props) => {
  const networkId = localStorage.getItem("orderly-networkId") ?? "mainnet";

  const wcV2InitOptions = {
    version: 2,
    projectId: "93dba83e8d9915dc6a65ffd3ecfd19fd",
    requiredChains: [42161],
    optionalChains: [421613, 42161],
    dappUrl: window.location.host,
  };

  const ledgerInitOptions = {
    projectId: "93dba83e8d9915dc6a65ffd3ecfd19fd",
  };

  const walletConnect = walletConnectModule(wcV2InitOptions);
  const ledger = ledgerModule(ledgerInitOptions);

  const options = {
    wallets: [
      injectedModule(), // metamask
      walletConnect,
      ledger,
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

  const onChainChanged = (chainId: number, isTestnet: boolean) => {
    // console.log('chain changed', chainId, isTestnet);
    localStorage.setItem(
      "orderly-networkId",
      isTestnet ? "testnet" : "mainnet"
    );
    // realod page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <ConnectorProvider options={options}>
      <OrderlyAppProvider
        networkId={networkId}
        brokerId="orderly"
        brokerName="Orderly"
        appIcons={{ secondary: { img: "/orderly_logo.svg" } }}
        onChainChanged={onChainChanged}
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
            profitColor: '#00B49E',
            lossColor: '#FF447C',
            brandColor: 'rgba(25, 199, 166, 1)',
            fontFamily: "DIN2014-Demi",
          },
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
