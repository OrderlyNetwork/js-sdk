import { useState } from "react";
import { useWalletConnector } from "./walletConnectProvider";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

export const Buttons = () => {
  const wallet = useWalletConnector();
  const { state, createAccount, createOrderlyKey } = useAccount();
  const [loading, setLoading] = useState(false);

  if (state.status === AccountStatusEnum.NotConnected) {
    return (
      <button
        disabled={loading}
        onClick={() => {
          wallet.connect().catch((err) => {
            console.log("err", err);
          });
        }}
      >
        Wallet connect
      </button>
    );
  }

  if (state.status < AccountStatusEnum.SignedIn) {
    return (
      <button
        disabled={loading}
        onClick={async () => {
          try {
            setLoading(true);
            await createAccount();
            setLoading(false);
          } catch (err) {}
        }}
      >
        Create orderly account
      </button>
    );
  }

  if (state.status < AccountStatusEnum.EnableTrading) {
    return (
      <button
        disabled={loading}
        onClick={async () => {
          try {
            setLoading(true);
            // remember
            await createOrderlyKey(true);
            setLoading(false);
          } catch (err) {}
        }}
      >
        Create orderly key
      </button>
    );
  }

  return (
    <button
      disabled={loading}
      onClick={() => {
        // wallet.connect();
      }}
    >
      Get account info
    </button>
  );
};
