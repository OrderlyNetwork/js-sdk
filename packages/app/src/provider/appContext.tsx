import {
  FC,
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";
import { useWalletEvent } from "../hooks/useWalletEvent";
import { useSettleEvent } from "../hooks/useSettleEvent";
import { useWalletConnectError } from "../hooks/useWalletConnectError";
import {
  RestrictedInfoOptions,
  useRestrictedInfo,
  RestrictedInfoReturns,
  useTrackingInstance,
} from "@orderly.network/hooks";
import { useLinkDevice } from "../hooks/useLinkDevice";
import { DefaultChain, useCurrentChainId } from "../hooks/useCurrentChainId";

type AppContextState = {
  connectWallet: ReturnType<typeof useWalletStateHandle>["connectWallet"];
  /**
   * Whether the current network is not supported
   */
  wrongNetwork: boolean;
  disabledConnect: boolean;
  currentChainId: number | undefined;
  setCurrentChainId: (chainId: number | undefined) => void;
  onChainChanged?: (
    chainId: number,
    state: { isTestnet: boolean; isWalletConnected: boolean }
  ) => void;
  // networkStatus: ReturnType<typeof useAppState>["networkStatus"];
  restrictedInfo: RestrictedInfoReturns;
  showAnnouncement: boolean;
  setShowAnnouncement: (show: boolean) => void;
};

const AppContext = createContext<AppContextState>({} as AppContextState);

export const useAppContext = () => {
  return useContext(AppContext);
};

export type AppStateProviderProps = {
  defaultChain?: DefaultChain;
  restrictedInfo?: RestrictedInfoOptions;
} & Pick<AppContextState, "onChainChanged">;

export const AppStateProvider: FC<PropsWithChildren<AppStateProviderProps>> = (
  props
) => {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentChainId, setCurrentChainId] = useCurrentChainId(
    props.defaultChain
  );
  useLinkDevice();
  useTrackingInstance();

  const { connectWallet, wrongNetwork } = useWalletStateHandle({
    // onChainChanged: props.onChainChanged,
    currentChainId,
  });

  useWalletEvent();
  useSettleEvent();
  useWalletConnectError();

  const restrictedInfo = useRestrictedInfo(props.restrictedInfo);

  const disabledConnect = restrictedInfo.restrictedOpen;

  return (
    <AppContext.Provider
      value={{
        connectWallet,
        wrongNetwork,
        currentChainId,
        setCurrentChainId,
        onChainChanged: props.onChainChanged,
        disabledConnect,
        restrictedInfo,
        showAnnouncement,
        setShowAnnouncement,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
