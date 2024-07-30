import { FC, createContext, PropsWithChildren, useContext } from "react";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";
import { useAppState } from "../hooks/useAppState";

type AppContextState = {
  connectWallet: ReturnType<typeof useWalletStateHandle>["connectWallet"];
  /**
   * Whether the current network is not supported
   */
  wrongNetwork: boolean;
  // networkStatus: ReturnType<typeof useAppState>["networkStatus"];
};

const AppContext = createContext<AppContextState>({} as AppContextState);

export const useAppContext = () => {
  return useContext(AppContext);
};

export type AppStateProviderProps = {
  onChainChanged?: (chainId: number, isTestnet: boolean) => void;
};

export const AppStateProvider: FC<PropsWithChildren<AppStateProviderProps>> = (
  props
) => {
  const { connectWallet, wrongNetwork } = useWalletStateHandle({
    onChainChanged: props.onChainChanged,
  });
  // const { networkStatus } = useAppState();

  return (
    <AppContext.Provider value={{ connectWallet, wrongNetwork }}>
      {props.children}
    </AppContext.Provider>
  );
};
