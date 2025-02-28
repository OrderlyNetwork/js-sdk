import { FC, createContext, PropsWithChildren, useContext } from "react";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";
import { useAppState } from "../hooks/useAppState";
import { useWalletEvent } from "../hooks/useWalletEvent";
import { useSettleEvent } from "../hooks/useSettleEvent";
import { useWalletConnectError } from "../hooks/useWalletConnectError";
import { RestrictedInfo } from "@orderly.network/hooks";
import { useLinkDevice } from "../hooks/useLinkDevice";
import { DefaultChain, useCurrentChainId } from "../hooks/useCurrentChainId";

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
  restrictedInfo?: RestrictedInfo;
};

const AppContext = createContext<AppContextState>({} as AppContextState);

export const useAppContext = () => {
  return useContext(AppContext);
};

export type AppStateProviderProps = {
  defaultChain?: DefaultChain;
} & Pick<AppContextState, "onChainChanged" | "restrictedInfo">;

export const AppStateProvider: FC<PropsWithChildren<AppStateProviderProps>> = (
  props
) => {
  const [currentChainId, setCurrentChainId] = useCurrentChainId(
    props.defaultChain
  );
  useLinkDevice();

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
        restrictedInfo: props.restrictedInfo,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
