import { useCallback, useContext, useEffect, useState } from "react";
import { AccountState } from "@orderly.network/core";
import { OrderlyContext } from "./orderlyContext";
import { useAccountInstance } from "./useAccountInstance";

export const useAccount = () => {
  const {
    configStore,
    keyStore,
    // onWalletConnect,
    // onWalletDisconnect,
    // onSetChain,
  } = useContext(OrderlyContext);

  if (!configStore)
    throw new Error("configStore is not defined, please use OrderlyProvider");

  if (!keyStore) {
    throw new Error(
      "keyStore is not defined, please use OrderlyProvider and provide keyStore"
    );
  }

  const account = useAccountInstance();

  const [state, setState] = useState<AccountState>(account.stateValue);

  const statusChangeHandler = (nextState: AccountState) => {
    //
    setState(() => nextState);
  };

  useEffect(() => {
    account.on("change:status", statusChangeHandler);

    return () => {
      account.off("change:status", statusChangeHandler);
    };
  }, []);

  const createOrderlyKey = useCallback(
    async (remember: boolean) => {
      return account.createOrderlyKey(remember ? 365 : 30);
    },
    [account]
  );

  const createAccount = useCallback(async () => {
    return account.createAccount();
  }, [account]);

  // console.log("--------", state);

  return {
    account,
    state,
    // info: {},
    // login,
    createOrderlyKey,
    createAccount,
    // disconnect,
    // connect,
    // setChain,
    // settlement,
  };
};
