import {
  FC,
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";
import { useAppState } from "../hooks/useAppState";
import { useWalletEvent } from "../hooks/useWalletEvent";
import { useSettleEvent } from "../hooks/useSettleEvent";
import { useWalletConnectError } from "../hooks/useWalletConnectError";
import {
  useRestrictedAreas,
  RestrictedAreasReturns,
  IRestrictedAreasParams,
  Chains,
} from "@orderly.network/hooks";
import { useLinkDevice } from "../hooks/useLinkDevice";
import { API, NetworkId } from "@orderly.network/types";

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
  currentChainFallback?: (
    chains: Chains,
    networkId: NetworkId
  ) => API.Chain | undefined;
  // networkStatus: ReturnType<typeof useAppState>["networkStatus"];
  restrictedInfo?: RestrictedAreasReturns;
};

const AppContext = createContext<AppContextState>({} as AppContextState);

export const useAppContext = () => {
  return useContext(AppContext);
};

export type AppStateProviderProps = {
  restrictedInfo?: IRestrictedAreasParams;
} & Pick<AppContextState, "onChainChanged" | "currentChainFallback">;

export const AppStateProvider: FC<PropsWithChildren<AppStateProviderProps>> = (
  props
) => {
  const [currentChainId, setCurrentChainId] = useState<number | undefined>();
  useLinkDevice();

  const { connectWallet, wrongNetwork } = useWalletStateHandle({
    // onChainChanged: props.onChainChanged,
    currentChainId,
  });

  useWalletEvent();
  useSettleEvent();
  useWalletConnectError();
  const restrictedInfo = useRestrictedAreas(props?.restrictedInfo ?? {});

  // const { networkStatus } = useAppState();

  return (
    <AppContext.Provider
      value={{
        connectWallet,
        wrongNetwork,
        currentChainId,
        setCurrentChainId,
        onChainChanged: props.onChainChanged,
        currentChainFallback: props.currentChainFallback,
        restrictedInfo,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
