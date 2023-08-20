import { useCallback, useContext, useState } from "react";
import useConstant from "use-constant";
import { Account, SimpleDI, AccountState } from "@orderly/core";
import { OrderlyContext } from "./orderlyContext";
import { useObservable } from "rxjs-hooks";

export const useAccount = (): {
  account: AccountState;
  login: (address: string) => void;
} => {
  const { configStore } = useContext(OrderlyContext);

  if (!configStore)
    throw new Error("configStore is not defined, please use OrderlyProvider");

  const account = useConstant(() => {
    let account = SimpleDI.get<Account>("account");

    if (!account) {
      account = new Account(configStore);

      SimpleDI.registerByName("account", account);
    }
    return account;
  });

  const state = useObservable<AccountState>(
    () => account.state$,
    account.stateValue
  );

  const login = useCallback(
    (address: string) => {
      account.login(address);
    },
    [account]
  );

  console.log(state);

  return {
    account: state!,
    login,
  };
};
