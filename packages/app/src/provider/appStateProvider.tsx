import { FC, PropsWithChildren, useState, useMemo } from "react";
import {
  RestrictedInfoOptions,
  useRestrictedInfo,
  useTrackingInstance,
} from "@veltodefi/hooks";
import { useAssetconvertEvent } from "../hooks/useAssetconvertEvent";
import { DefaultChain, useCurrentChainId } from "../hooks/useCurrentChainId";
import { useLinkDevice } from "../hooks/useLinkDevice";
import { useSettleEvent } from "../hooks/useSettleEvent";
import { useWalletConnectError } from "../hooks/useWalletConnectError";
import { useWalletEvent } from "../hooks/useWalletEvent";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";
import { AppContextState, AppStateContext } from "./appStateContext";

export type RouteOption = {
  href: "/portfolio" | "/portfolio/history";
  name: string;
};

export type AppStateProviderProps = {
  defaultChain?: DefaultChain;
  restrictedInfo?: RestrictedInfoOptions;
} & Pick<AppContextState, "onChainChanged" | "onRouteChange" | "widgetConfigs">;

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
      widgetConfigs: props.widgetConfigs,
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
      props.widgetConfigs,
    ],
  );

  return (
    <AppStateContext.Provider value={memoizedValue}>
      {props.children}
    </AppStateContext.Provider>
  );
};
