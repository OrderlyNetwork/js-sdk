import useConstant from "use-constant";
import { Account, SimpleDI } from "@orderly.network/core";
import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";
import { SDKError } from "@orderly.network/types";

export const useAccountInstance = (): Account => {
  const { configStore, keyStore, walletAdapters } = useContext(OrderlyContext);

  if (!configStore)
    throw new SDKError(
      "configStore is not defined, please use OrderlyProvider"
    );

  if (!keyStore) {
    throw new SDKError(
      "keyStore is not defined, please use OrderlyProvider and provide keyStore"
    );
  }

  const account = useConstant(() => {
    let account = SimpleDI.get<Account>("account");

    if (!account) {
      account = new Account(
        configStore,
        keyStore,
        // getWalletAdapter,
        walletAdapters
      );

      SimpleDI.registerByName("account", account);
    }
    return account;
  });

  return account;
};
