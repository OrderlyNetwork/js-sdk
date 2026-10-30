import React, { useContext, useEffect, useMemo } from "react";
import {
  OrderlyContext,
  useChains,
  useMemoizedFn,
} from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import {
  AnnouncementProvider,
  useAnnouncementArticles,
  useMaintenanceAnnouncement,
} from "@orderly.network/ui-notification";
import { checkChainSupport } from "../../utils/chain";
import { ScaffoldContext, ScaffoldState } from "./scaffoldContext";
import { useSharedAnnouncementState } from "./useSharedAnnouncementState";

export type ScaffoldProviderProps = Omit<
  ScaffoldState,
  "checkChainSupport" | "announcementState"
>;
const ScaffoldProviderContent: React.FC<
  React.PropsWithChildren<ScaffoldProviderProps>
> = (props) => {
  const {
    routerAdapter,
    expanded,
    setExpand,
    topNavbarHeight,
    footerHeight,
    announcementHeight,
    children,
  } = props;

  const [chains] = useChains();

  const { networkId } = useContext<any>(OrderlyContext);

  const legacyAnnouncementState = useMaintenanceAnnouncement();
  const articles = useAnnouncementArticles();
  const announcementState = useSharedAnnouncementState(
    articles.scaffoldState,
    legacyAnnouncementState,
  );
  const { setShowAnnouncement } = useAppContext();
  useEffect(
    () => setShowAnnouncement(announcementState.showAnnouncement),
    [announcementState.showAnnouncement, setShowAnnouncement],
  );

  const checkChainSupportHandle = useMemoizedFn((chainId: number | string) => {
    return checkChainSupport(
      chainId,
      networkId === "testnet" ? chains.testnet : chains.mainnet,
    );
  });

  const memoizedValue = useMemo<ScaffoldState>(() => {
    return {
      routerAdapter: routerAdapter,
      expanded: expanded,
      setExpand: setExpand,
      checkChainSupport: checkChainSupportHandle,
      topNavbarHeight: topNavbarHeight,
      footerHeight: footerHeight,
      announcementHeight: announcementHeight,
      announcementState: announcementState,
    };
  }, [
    routerAdapter,
    expanded,
    setExpand,
    checkChainSupportHandle,
    topNavbarHeight,
    footerHeight,
    announcementHeight,
    announcementState,
  ]);

  return (
    <ScaffoldContext.Provider value={memoizedValue}>
      {children}
    </ScaffoldContext.Provider>
  );
};

export const ScaffoldProvider: React.FC<
  React.PropsWithChildren<ScaffoldProviderProps>
> = (props) => (
  <AnnouncementProvider>
    <ScaffoldProviderContent {...props} />
  </AnnouncementProvider>
);
