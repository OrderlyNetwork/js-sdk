import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { OrderlyAppProvider } from "@orderly.network/react";

import "../global.css";
import "@orderly.network/react/dist/styles.css";


export default function MyApp({ Component, pageProps }) {
  return (
    <ConnectorProvider>
      <OrderlyAppProvider brokerId="orderly" networkId="testnet">
        <Component {...pageProps} />
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
}
