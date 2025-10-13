import React, { useCallback, useContext, useMemo } from "react";
import {
  OrderlyContext,
  useChains,
  useMemoizedFn,
} from "@kodiak-finance/orderly-hooks";
import { checkChainSupport } from "../../utils/chain";
import { ScaffoldContext, ScaffoldState } from "./scaffoldContext";

export type ScaffoldProviderProps = Omit<ScaffoldState, "checkChainSupport">;

export const ScaffoldProvider: React.FC<
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
    };
  }, [
    routerAdapter,
    expanded,
    setExpand,
    checkChainSupportHandle,
    topNavbarHeight,
    footerHeight,
    announcementHeight,
  ]);

  return (
    <ScaffoldContext.Provider value={memoizedValue}>
      {children}
    </ScaffoldContext.Provider>
  );
};
