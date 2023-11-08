import { useCallback, useContext, useEffect, useState } from "react";
import { Account, AccountState } from "@orderly.network/core";
import { OrderlyContext } from "./orderlyContext";
import { useAccountInstance } from "./useAccountInstance";

export const useAccount = (): {
  account: Account;
  state: AccountState;
  // login: (address: string) => void;
  createOrderlyKey: (remember: boolean) => Promise<string>;
  createAccount: () => Promise<string>;
  // disconnect: () => Promise<void>;
  // connect: () => Promise<any>;
  // setChain: (chainId: number) => Promise<any>;
  // settlement: () => Promise<any>;
  // info: API.AccountInfo | undefined;
} => {
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
    async (remember: boolean) => {
      return account.createOrderlyKey(remember ? 365 : 30);
    },
    [account]
  );

  const createAccount = useCallback(async () => {
    return account.createAccount();
  }, [account]);

  // const connect = useCallback(async () => {
  //   return onWalletConnect?.();
  // }, [account]);

  // // const settlement = useCallback(async () => {
  // //   return account.settlement();
  // // }, [account]);

  // const disconnect = async () => {
  //   // account.disconnect();
  //   return onWalletDisconnect?.();
  // };

  // const setChain = async (chainId: number) => {
  //   return onSetChain?.(chainId);
  // };

  return {
    // account: state!,
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
