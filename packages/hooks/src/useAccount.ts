import { useCallback, useContext, useEffect, useState } from "react";
import { AccountState } from "@orderly.network/core";
import { OrderlyContext } from "./orderlyContext";
import { useAccountInstance } from "./useAccountInstance";
import { useEventEmitter } from './useEventEmitter'
import { EnumTrackerKeys, AccountStatusEnum } from "@orderly.network/types";
import { useTrack } from "./useTrack";

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
  const {track} = useTrack();


  const statusChangeHandler = (nextState: AccountState) => {
  
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
      track(EnumTrackerKeys.signinSuccess,{
        network: account.chainId,
        wallet: state.connectWallet?.name
      });
      return account.createOrderlyKey(remember ? 365 : 30);
    },
    [account,state]
  );

  const createAccount = useCallback(async () => {
    return account.createAccount();
  }, [account]);

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
