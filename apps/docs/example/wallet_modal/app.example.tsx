import { OrderlyConfigProvider } from "@orderly.network/hooks";
import "./style.css";
import { Account } from "./account";
import { WalletButton } from "./walletButton";
import { WalletConnectProvider } from "./walletConnectProvider";

export default function App() {
  return (
    <OrderlyConfigProvider brokerId="orderly" networkId="testnet">
      <WalletConnectProvider>
        <div className="container">
          <Account />
          <WalletButton />
        </div>
      </WalletConnectProvider>
    </OrderlyConfigProvider>
  );
}
