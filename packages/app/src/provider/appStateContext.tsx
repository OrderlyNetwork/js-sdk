import React, { createContext, useContext } from "react";
import {
  RestrictedInfoReturns,
  type MarketCategoryConfig,
} from "@orderly.network/hooks";
import type {
  AppFeatures,
  RouteOption,
  WalletChainChangeState,
} from "@orderly.network/types";
import { useWalletStateHandle } from "../hooks/useWalletStateHandle";

export type { RouteOption } from "@orderly.network/types";

export type WidgetConfigs = {
  announcement?: {
    /** Exclude Orderly official announcements from all announcement views. Defaults to false. */
    excludeOfficial?: boolean;
  };
  scanQRCode?: {
    onSuccess?: (url: string) => void;
  };
  subAccount?: {
    /** @deprecated The number of custom sub-accounts needs to be configured in sync with the backend. If you’re not sure about it, please don’t set this value. */
    maxSubAccountCount: number;
  };
  withdraw?: {
    /**
     * Control the "withdraw to other wallet" feature.
     * - `true` / `undefined`: enable external wallet trigger & management.
     * - `false`: only show the connected wallet address without external
     *   wallet selector or add-wallet dialog.
     */
    enableWithdrawToExternalWallet?: boolean;
  };
  /**
   * Custom market tab configuration.
   * Function receives the default built-in tabs and context, returns the final tab sequence.
   */
  marketTabs?: MarketCategoryConfig;
};

export type AppContextState = {
  /** Application features; only explicit false disables a feature. */
  features?: AppFeatures;
  connectWallet: ReturnType<typeof useWalletStateHandle>["connectWallet"];
  /**
   * Whether the current network is not supported
   */
  wrongNetwork: boolean;
  disabledConnect: boolean;
  currentChainId: number | undefined;
  setCurrentChainId: (chainId: number | undefined) => void;
  onChainChanged?: (chainId: number, state: WalletChainChangeState) => void;
  // networkStatus: ReturnType<typeof useAppState>["networkStatus"];
  restrictedInfo: RestrictedInfoReturns;
  showAnnouncement: boolean;
  setShowAnnouncement: (show: boolean) => void;
  /**
   * Host navigation callback bridging SDK route changes to the app router.
   * See `RouterAdapter` for the option shape and `href` conventions.
   */
  onRouteChange?: (option: RouteOption) => void;
  widgetConfigs?: WidgetConfigs;
  initialized: boolean;
};

export const AppStateContext = createContext<AppContextState>({
  setCurrentChainId: (chainId?: number) => {},
  restrictedInfo: {},
  setShowAnnouncement: (show: boolean) => {},
} as AppContextState);

export const useAppContext = () => {
  return useContext(AppStateContext);
};
