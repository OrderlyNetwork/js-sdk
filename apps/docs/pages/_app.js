import { OrderlyConfigProvider } from "@orderly.network/hooks";
import { DocProvider } from "@/components/docProvider";
import {ConnectorProvider} from '@orderly.network/web3-onboard'

import "../global.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <ConnectorProvider>
      <OrderlyConfigProvider brokerId="orderly" networkId="testnet">
        <DocProvider>

        <Component {...pageProps} />
        </DocProvider>
      </OrderlyConfigProvider>
    </ConnectorProvider>
  );
}
