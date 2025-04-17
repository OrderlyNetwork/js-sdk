import { OrderlyContext, useChains } from "@orderly.network/hooks";
import { ScaffoldContext, ScaffoldState } from "./scaffoldContext";
import { FC, ReactNode, useContext } from "react";
import { checkChainSupport } from "../../utils/chain";

export type ScaffoldProviderProps = {
  children: ReactNode;
} & Omit<ScaffoldState, "checkChainSupport">;

export const ScaffoldProvider: FC<ScaffoldProviderProps> = (props) => {
  const [chains] = useChains();

  const { networkId } = useContext<any>(OrderlyContext);

  const checkChainSupportHandle = (chainId: number | string) => {
    return checkChainSupport(
      chainId,
      networkId === "testnet" ? chains.testnet : chains.mainnet
    );
  };

  const onExpandChange = (expand: boolean) => {
    props.setExpand(expand);
  };

  return (
    <ScaffoldContext.Provider
      value={{
        routerAdapter: props.routerAdapter,
        expanded: props.expanded,
        setExpand: onExpandChange,
        checkChainSupport: checkChainSupportHandle,
        topNavbarHeight: props.topNavbarHeight,
        footerHeight: props.footerHeight,
        announcementHeight: props.announcementHeight,
      }}
    >
      {props.children}
    </ScaffoldContext.Provider>
  );
};
