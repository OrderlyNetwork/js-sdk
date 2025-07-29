import {
  FC,
  createContext,
  PropsWithChildren,
  useContext,
  useState,
  useMemo,
} from "react";
import {
  RestrictedInfoOptions,
  useRestrictedInfo,
  RestrictedInfoReturns,
  useTrackingInstance,
} from "@orderly.network/hooks";
import { useAssetconvertEvent } from "../hooks/useAssetconvertEvent";
import { DefaultChain, useCurrentChainId } from "../hooks/useCurrentChainId";
import { useLinkDevice } from "../hooks/useLinkDevice";
import { useSettleEvent } from "../hooks/useSettleEvent";
import { useWalletConnectError } from "../hooks/useWalletConnectError";
import { useWalletEvent } from "../hooks/useWalletEvent";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";

export type RouteOption = {
  href: "/portfolio" | "/portfolio/history";
  name: string;
};

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
    state: { isTestnet: boolean; isWalletConnected: boolean },
  ) => void;
  // networkStatus: ReturnType<typeof useAppState>["networkStatus"];
  restrictedInfo: RestrictedInfoReturns;
  showAnnouncement: boolean;
  setShowAnnouncement: (show: boolean) => void;
  onRouteChange?: (option: RouteOption) => void;
};

const AppContext = createContext<AppContextState>({
  setCurrentChainId: (chainId?: number) => {},
  restrictedInfo: {},
  setShowAnnouncement: (show: boolean) => {},
} as AppContextState);

export const useAppContext = () => {
  return useContext(AppContext);
};

export type AppStateProviderProps = {
  defaultChain?: DefaultChain;
  restrictedInfo?: RestrictedInfoOptions;
} & Pick<AppContextState, "onChainChanged" | "onRouteChange">;

export const AppStateProvider: FC<PropsWithChildren<AppStateProviderProps>> = (
  props,
) => {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentChainId, setCurrentChainId] = useCurrentChainId(
    props.defaultChain,
  );
  useLinkDevice();
  useTrackingInstance();

  const { connectWallet, wrongNetwork } = useWalletStateHandle({
    // onChainChanged: props.onChainChanged,
    currentChainId,
  });

  useWalletEvent();
  useSettleEvent();
  useAssetconvertEvent();
  useWalletConnectError();

  const restrictedInfo = useRestrictedInfo(props.restrictedInfo);

  const disabledConnect = restrictedInfo.restrictedOpen;

  const memoizedValue = useMemo<AppContextState>(
    () => ({
      connectWallet,
      wrongNetwork,
      currentChainId,
      setCurrentChainId,
      onChainChanged: props.onChainChanged,
      disabledConnect,
      restrictedInfo,
      showAnnouncement,
      setShowAnnouncement,
      onRouteChange: props.onRouteChange,
    }),
    [
      connectWallet,
      currentChainId,
      disabledConnect,
      props.onChainChanged,
      restrictedInfo,
      setCurrentChainId,
      showAnnouncement,
      wrongNetwork,
      props.onRouteChange,
    ],
  );

  return (
    <AppContext.Provider value={memoizedValue}>
      {props.children}
    </AppContext.Provider>
  );
};
