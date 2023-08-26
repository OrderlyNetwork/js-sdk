import { useCallback, useContext, useState } from "react";
import useConstant from "use-constant";
import { Account, SimpleDI, AccountState } from "@orderly/core";
import { OrderlyContext } from "./orderlyContext";
import { useObservable } from "rxjs-hooks";
import { API } from "@orderly/types";
import { usePrivateQuery } from "./usePrivateQuery";

export const useAccount = (): {
  account: AccountState;
  login: (address: string) => void;
  info: API.AccountInfo | undefined;
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

  const { data: accountInfo } =
    usePrivateQuery<API.AccountInfo>("/client/info");

  // console.log(accountInfo);

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

  // console.log(state);
  //maxLeverage

  return {
    account: state!,
    info: accountInfo,
    login,
  };
};
