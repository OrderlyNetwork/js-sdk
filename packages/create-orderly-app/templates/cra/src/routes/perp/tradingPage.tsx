import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyAppProvider, TradingPage } from "@orderly.network/react";
import { Navigate, useParams } from "react-router-dom";

function Trading() {
  let { symbol } = useParams();

  if (!symbol) {
    return <Navigate to={"/perp/PERP_ETH_USDC"} replace />;
  }

  return (
    <ConnectorProvider>
      <OrderlyAppProvider
        networkId="testnet"
        brokerId="orderly"
        logoUrl="<Your brand logo url>"
      >
        <TradingPage
          symbol={symbol}
          //   @ts-ignore
          tradingViewConfig={undefined}
        />
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
}

export default Trading;
