"use client";

import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyAppProvider, TradingPage } from "@orderly.network/react";

export default function Trading({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.startsWith("PERP-")
    ? params.symbol
    : `PERP-${params.symbol}`;

  return (
    <ConnectorProvider apiKey={''}>
      <OrderlyAppProvider
        networkId="testnet"
        brokerId="orderly"
        logoUrl="<Your brand logo url>"
      >
        <TradingPage symbol={symbol} tradingViewConfig={undefined} />
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
}
