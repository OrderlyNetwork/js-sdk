import { OrderlyConfigProvider } from "@orderly.network/hooks";
import { WalletProvider } from "@/components/walletProvider";
import { DocProvider } from "@/components/docProvider";
import "../global.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <WalletProvider>
      <OrderlyConfigProvider brokerId="orderly" networkId="testnet">
        <DocProvider>

        <Component {...pageProps} />
        </DocProvider>
      </OrderlyConfigProvider>
    </WalletProvider>
  );
}
