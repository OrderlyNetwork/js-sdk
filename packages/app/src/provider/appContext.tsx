import { FC, createContext, PropsWithChildren, useContext, useState } from "react";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";
import { useAppState } from "../hooks/useAppState";
import { useWalletEvent } from "../hooks/useWalletEvent";
import { useSettleEvent } from "../hooks/useSettleEvent";
import { useWalletConnectError } from "../hooks/useWalletConnectError";

type AppContextState = {
  connectWallet: ReturnType<typeof useWalletStateHandle>["connectWallet"];
  /**
   * Whether the current network is not supported
   */
  wrongNetwork: boolean;
  currentChainId: number | undefined;
  setCurrentChainId: (chainId: number | undefined) => void;
  onChainChanged?: (
    chainId: number,
    state: { isTestnet: boolean; isWalletConnected: boolean }
  ) => void;
  // networkStatus: ReturnType<typeof useAppState>["networkStatus"];
};

const AppContext = createContext<AppContextState>({} as AppContextState);

export const useAppContext = () => {
  return useContext(AppContext);
};

export type AppStateProviderProps = {
  onChainChanged?: (
    chainId: number,
    state: { isTestnet: boolean; isWalletConnected: boolean }
  ) => void;
};

export const AppStateProvider: FC<PropsWithChildren<AppStateProviderProps>> = (
  props
) => {
  const [currentChainId, setCurrentChainId] = useState<number | undefined>();

  const { connectWallet, wrongNetwork } = useWalletStateHandle({
    // onChainChanged: props.onChainChanged,
    currentChainId,
  });

  useWalletEvent();
  useSettleEvent();
  useWalletConnectError();

  // const { networkStatus } = useAppState();

  return (
    <AppContext.Provider
      value={{
        connectWallet,
        wrongNetwork,
        currentChainId,
        setCurrentChainId,
        onChainChanged: props.onChainChanged,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
