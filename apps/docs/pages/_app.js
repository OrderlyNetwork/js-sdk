// import { OrderlyConfigProvider } from "@orderly.network/hooks";
import {ConnectorProvider} from '@orderly.network/web3-onboard'
import {OrderlyAppProvider} from '@orderly.network/react'

import "../global.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <ConnectorProvider>
      <OrderlyAppProvider brokerId="orderly" networkId="testnet">
        <Component {...pageProps} />
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
}
