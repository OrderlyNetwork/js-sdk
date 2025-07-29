import { OrderlyAppProvider } from "@orderly.network/react";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import "../global.css";
import "@orderly.network/react/dist/styles.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <ConnectorProvider>
      <OrderlyAppProvider
        brokerId="orderly"
        brokerName="Orderly"
        networkId="testnet"
        appIcons={{
          main: {
            img: "/orderly-logo.svg",
          },
          secondary: {
            img: "/orderly-logo-secondary.svg",
          },
        }}
      >
        <Component {...pageProps} />
      </OrderlyAppProvider>
    </ConnectorProvider>
  );
}
