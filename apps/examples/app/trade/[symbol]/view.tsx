import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyAppProvider, TradingPage } from "@orderly.network/react";

interface Props {
  onSymbolChange: (symbol: string) => void;
  symbol: string;
}

const View = (props: Props) => {
  return (
    <ConnectorProvider>
      <OrderlyAppProvider
        networkId="mainnet"
        brokerId="orderly"
        logoUrl="/woo_fi_logo.svg"
      >
        <TradingPage symbol={"PERP_ETH_USDC"} tradingViewConfig={undefined} />
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
};

export default View;
