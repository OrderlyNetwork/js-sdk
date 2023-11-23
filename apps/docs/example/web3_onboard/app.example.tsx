import { OrderlyConfigProvider } from "@orderly.network/hooks";
import "./style.css";
import { Account } from "./account";
import { Buttons } from "./buttons";
import { WalletConnectProvider } from "./walletConnectProvider";

export default function App() {
  return (
    <OrderlyConfigProvider brokerId="orderly" networkId="testnet">
      <WalletConnectProvider>
        <div className="container">
          <Account />
          <Buttons />
        </div>
      </WalletConnectProvider>
    </OrderlyConfigProvider>
  );
}
