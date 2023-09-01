import { useCallback, useContext, useState } from "react";
import useConstant from "use-constant";
import { Account, SimpleDI, AccountState } from "@orderly.network/core";
import { OrderlyContext } from "./orderlyContext";
import { useObservable } from "rxjs-hooks";

export const useAccount = (): {
  account: Account;
  state: AccountState;
  login: (address: string) => void;
  // info: API.AccountInfo | undefined;
} => {
  const { configStore, keyStore, walletAdapter } = useContext(OrderlyContext);

  if (!configStore)
    throw new Error("configStore is not defined, please use OrderlyProvider");

  if (!keyStore) {
    throw new Error(
      "keyStore is not defined, please use OrderlyProvider and provide keyStore"
    );
  }

  const account = useConstant(() => {
    let account = SimpleDI.get<Account>("account");

    if (!account) {
      account = new Account(configStore, keyStore, walletAdapter);

      SimpleDI.registerByName("account", account);
    }
    return account;
  });

  const state = useObservable<AccountState>(
    () => account.state$,
    account.stateValue
  );

  // const { data: accountInfo } =
  //   usePrivateQuery<API.AccountInfo>("/client/info");

  // console.log(accountInfo);

  const login = useCallback(
    (address: string) => {
      account.login(address);
    },
    [account]
  );

  return {
    // account: state!,
    account,
    state,
    // info: {},
    login,
  };
};
