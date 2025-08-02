import { createContext, useContext } from "react";
import { RestrictedInfoReturns } from "@orderly.network/hooks";
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

const AppStateContext = createContext<AppContextState>({
  setCurrentChainId: (chainId?: number) => {},
  restrictedInfo: {},
  setShowAnnouncement: (show: boolean) => {},
} as AppContextState);

export const useAppContext = () => {
  return useContext(AppStateContext);
};
