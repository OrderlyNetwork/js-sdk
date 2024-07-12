import { Box, cn, Flex, Grid, type SizeType } from "@orderly.network/ui";
import { MainNavWidget } from "./main/mainNav.widget";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { SideNavbarWidget } from "./sidebar";
import { SideBarProps } from "./sidebar";
import {
  OrderlyContext,
  useChains,
  useLocalStorage,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useMemo } from "react";
import { ExpandableContext } from "./scaffoldContext";
import { checkChainSupport } from "../utils/chain";
import { FooterConfig, FooterWidget } from "./footer";

export type routerAdapter = {
  onRouteChange: (path: string) => void;
  currentPath: string;
};

export type LayoutProps = {
  /**
   * Custom left sidebar component,
   * if provided, the layout will use this component over the default sidebar component
   */
  leftSidebar?: React.ReactNode;
  gap?: number;
  maxWidth?: number;
  bodyPadding?: SizeType;
  leftSideProps?: SideBarProps;
  rightSidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  // topBarProps?:
  footer?: React.ReactNode;
  routerAdapter?: routerAdapter;
  footerHeight?: number;
  footerIsSticky?: boolean;
  footerConfig?: FooterConfig;
  classNames?: {
    cotent?: string;
    body?: string;
    leftSidebar?: string;
    topNavbar?: string;
    footer?: string;
  };
};

export const Scaffold = (props: PropsWithChildren<LayoutProps>) => {
  const { classNames, footerConfig } = props;
  const [expand, setExpand] = useLocalStorage(
    "orderly_scaffold_expanded",
    true
  );
  const { connectedChain } = useWalletConnector();
  const [unsupported, setUnsupported] = useState(true);
  const [chains] = useChains();

  const sideBarDefaultWidth = useMemo(() => props.maxWidth || 185, []);
  const { networkId } = useContext<any>(OrderlyContext);

  const checkChainSupportHandle = (chainId: number | string) => {
    return checkChainSupport(
      chainId,
      networkId === "testnet" ? chains.testnet : chains.mainnet
    );
  };

  useEffect(() => {
    if (!connectedChain) return;

    let isSupported = checkChainSupportHandle(connectedChain.id);

    setUnsupported(!isSupported);
  }, [connectedChain?.id, chains]);

  const onExpandChange = (expand: boolean) => {
    setExpand(expand);
  };

  return (
    <ExpandableContext.Provider
      value={{
        expanded: expand,
        setExpand: onExpandChange,
        unsupported,
        checkChainSupport: checkChainSupportHandle,
        footerConfig
      }}
    >
      {/* Top main nav */}
      <Box
        className={cn("oui-border-b oui-border-line-12", classNames?.topNavbar)}
      >
        {props.topbar ?? <MainNavWidget />}
      </Box>
      {/*--------- body start ------ */}
      <Grid
        className={cn("oui-box-content oui-transition-all oui-h-[calc(100%-29px)]")}
        style={{
          gridTemplateColumns: `${
            expand ? sideBarDefaultWidth + "px" : "98px"
          } 1fr`,
          gridTemplateRows: "auto 1fr auto",
          gridTemplateAreas: `"left main" "left main" "left main"`,
        }}
      >
        <div className="oui-h-[calc(100% - 29px)">
          {/* @ts-ignore */}
          {props.leftSidebar || <SideNavbarWidget {...props.leftSideProps} />}

          {/* <SideNavbarWidget {...props.leftSideProps} /> */}
        </div>
        <Box>{props.children}</Box>
      </Grid>
      {/* <Flex
        itemAlign={"start"}
        gap={{ initial: props.gap ?? 0 }}
        className={cn(classNames?.body)}
      >

      </Flex> */}
      {/*--------- body end ------ */}
      {/* Footer */}
      <Box className={cn(classNames?.footer)}>{props.footer || (<FooterWidget />)}</Box>
    </ExpandableContext.Provider>
  );
};
