"use client";

import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyAppProvider, TradingPage } from "@orderly.network/react";
import Config from '../../config'

export default function Trading({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.startsWith("PERP-")
    ? params.symbol
    : `PERP-${params.symbol}`;

  const config = Config({})

  return (
    <ConnectorProvider {...config.wallet}>
      <OrderlyAppProvider
        networkId="testnet"
        brokerId="orderly"
        logoUrl="<Your brand logo url>"
        onChainChanged={()=>{
            // TODO: handle on chain changed
        }}
      >
        <TradingPage symbol={symbol} tradingViewConfig={config.app.tradingView} />
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
}
