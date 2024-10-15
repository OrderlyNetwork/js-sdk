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

  // const { data: userInfo } =
  //   usePrivateQuery<API.AccountInfo>("/v1/client/info");

  // console.log("userInfo", userInfo);

  // const state = useObservable<AccountState>(
  //   () => account.state$,
  //   account.stateValue
  // );

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

  // const login = useCallback(
  //   (address: string) => {
  //     account.login(address);
  //   },
  //   [account]
  // );

  const createOrderlyKey = useCallback(
    async (
      remember: boolean,
      scope?: string,
      shouldMutateAppState: boolean = true
    ) => {
      return account.createOrderlyKey(
        remember ? 365 : 30,
        scope,
        shouldMutateAppState
      );
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
