import { OrderlyConfigProvider } from "@orderly.network/hooks";
import "../global.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <OrderlyConfigProvider brokerId="woofi_pro" networkId="testnet">
      <Component {...pageProps} />
    </OrderlyConfigProvider>
  );
}
