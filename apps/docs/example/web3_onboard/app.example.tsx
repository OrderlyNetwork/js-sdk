import { OrderlyConfigProvider } from "@orderly.network/hooks";

import { Account } from "./account";
import { WalletButton } from "./walletButton";
import { WalletConnectProvider } from "./walletConnectProvider";

export default function App() {
  return (
    <OrderlyConfigProvider brokerId="orderly" networkId="testnet">
      <WalletConnectProvider>
        <div className="App">
          <WalletButton />
          <Account />
        </div>
      </WalletConnectProvider>
    </OrderlyConfigProvider>
  );
}
