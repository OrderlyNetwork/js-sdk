import { Box, cn, Flex, Grid, type SizeType } from "@orderly.network/ui";
import { MainNavWidget } from "./main/mainNav.widget";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { SideMenuItem, SideNavbarWidget } from "./sidebar";
import { SideBarProps } from "./sidebar";
import {
  OrderlyContext,
  useChains,
  useLocalStorage,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useMemo } from "react";
import {
  ExpandableContext,
  // MainNavProps,
  routerAdapter,
} from "./scaffoldContext";
import { checkChainSupport } from "../utils/chain";
import { FooterConfig, FooterWidget } from "./footer";
import { MainNavProps } from "./main/useWidgetBuilder.script";
import { MaintenanceTipsWidget } from "./maintenanceTips";

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
  mainNavProps?: MainNavProps;
  footer?: React.ReactNode;
  routerAdapter?: routerAdapter;
  footerHeight?: number;
  footerIsSticky?: boolean;
  footerConfig?: FooterConfig;
  classNames?: {
    content?: string;
    body?: string;
    leftSidebar?: string;
    topNavbar?: string;
    footer?: string;
  };
};

export const Scaffold = (props: PropsWithChildren<LayoutProps>) => {
  const { classNames, footerConfig, routerAdapter } = props;
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
    <div className="oui-relative oui-h-screen">
      <ExpandableContext.Provider
        value={{
          routerAdapter,
          expanded: expand,
          setExpand: onExpandChange,
          unsupported,
          checkChainSupport: checkChainSupportHandle,
          footerConfig,
          // mainNavProps: props.mainNavProps,
        }}
      >
        {/* Top main nav */}
        <Box
          className={cn(
            "oui-hidden xl:oui-block",
            "oui-border-b oui-border-line-12",
            classNames?.topNavbar
          )}
        >
          {props.topbar ?? <MainNavWidget {...props.mainNavProps} />}
        </Box>
        <MaintenanceTipsWidget />
        {/*--------- body start ------ */}
        {props.leftSidebar === null ? (
          // ----------No leftSidebar layout start ---------
          <Box className={classNames?.content}>{props.children}</Box>
        ) : (
          // ----------No leftSidebar layout end ---------
          // ---------- left & body layout start ---------
          <Grid
            className={cn(
              "oui-box-content oui-transition-all oui-h-[calc(100%-29px)] oui-flex xl:oui-grid",
              classNames?.body
            )}
            style={{
              gridTemplateColumns: `${
                expand ? sideBarDefaultWidth + "px" : "98px"
              } 1fr`,
              gridTemplateRows: "auto 1fr auto",
              gridTemplateAreas: `"left main" "left main" "left main"`,
            }}
          >
            <div className={cn(classNames?.leftSidebar)}>
              {/* @ts-ignore */}
              {typeof props.leftSidebar !== "undefined" ? (
                props.leftSidebar
              ) : (
                <SideNavbarWidget {...props.leftSideProps} />
              )}

              {/* <SideNavbarWidget {...props.leftSideProps} /> */}
            </div>
            <Box width={"100%"} className={classNames?.content}>
              {props.children}
            </Box>
          </Grid>
          // ---------- left & body layout end ---------
        )}

        <Box
          className={cn(
            "oui-fixed oui-bottom-0 oui-w-full",
            classNames?.footer
          )}
        >
          {props.footer || <FooterWidget />}
        </Box>
      </ExpandableContext.Provider>
    </div>
  );
};
