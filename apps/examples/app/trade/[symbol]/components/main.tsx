"use client";

import { OrderlyProvider, TradingPage } from "@orderly.network/components";
import {
  MemoryConfigStore,
  EtherAdapter,
  BaseContractManager,
  LocalStorageStore,
} from "@orderly.network/core";
import { WalletConnectorProvider } from "./walletConnectorProvider";

export const TradingMainPage = () => {
  const configStore = new MemoryConfigStore();
  const contractManager = new BaseContractManager(configStore);

  const onSymbolChange = (symbol: any) => {
    console.log("symbol", symbol);
    // history.push(generatePath({ path: generateSymbolPath(symbol.symbol) }));
  };
  return (
    <WalletConnectorProvider>
      <OrderlyProvider
        configStore={configStore}
        contractManager={contractManager}
        keyStore={new LocalStorageStore("testnet")}
        logoUrl="/woo_fi_logo.svg"
        getWalletAdapter={(options) => new EtherAdapter(options)}
      >
        <TradingPage
          onSymbolChange={onSymbolChange}
          symbol={"PERP_ETH_USDC"}
          tradingViewConfig={{
            scriptSRC: "/tradingview/charting_library/charting_library.js",
            library_path: "/tradingview/charting_library/",
          }}
        />
      </OrderlyProvider>
    </WalletConnectorProvider>
  );
};
