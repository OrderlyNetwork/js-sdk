import useConstant from "use-constant";
import { Account, SimpleDI } from "@orderly.network/core";
import { useContext } from "react";
import { OrderlyContext } from "./orderlyContext";

export const useAccountInstance = () => {
  const { configStore, keyStore } = useContext(OrderlyContext);

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
      account = new Account(configStore, keyStore);

      SimpleDI.registerByName("account", account);
    }
    return account;
  });

  console.log("account instance ======>>>>>", account);

  return account;
};
