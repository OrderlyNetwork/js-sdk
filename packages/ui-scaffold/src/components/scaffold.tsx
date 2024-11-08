import { Box, cn, Grid, type SizeType } from "@orderly.network/ui";
import { MainNavWidget } from "./main/mainNav.widget";
import React, { PropsWithChildren, useContext } from "react";
import { SideNavbarWidget } from "./sidebar";
import { SideBarProps } from "./sidebar";
import {
  OrderlyContext,
  useChains,
  useLocalStorage,
} from "@orderly.network/hooks";
import { useMemo } from "react";
import {
  ExpandableContext,
  // MainNavProps,
  routerAdapter,
} from "./scaffoldContext";
import { checkChainSupport } from "../utils/chain";
import { FooterConfig, FooterWidget } from "./footer";
import { MainNavWidgetProps } from "./main/useWidgetBuilder.script";
import { MaintenanceTipsWidget } from "./maintenanceTips";

export type LayoutProps = {
  /**
   * Custom left sidebar component,
   * if provided, the layout will use this component over the default sidebar component
   */
  gap?: number;
  maxWidth?: number;
  bodyPadding?: SizeType;
  leftSidebar?: React.ReactNode;
  leftSideProps?: SideBarProps;
  rightSidebar?: React.ReactNode;
  topBar?: React.ReactNode;
  // topBarProps?:
  mainNavProps?: PropsWithChildren<MainNavWidgetProps>;
  footer?: React.ReactNode;
  routerAdapter?: routerAdapter;
  footerHeight?: number;
  footerIsSticky?: boolean;
  footerConfig?: FooterConfig;
  classNames?: {
    root?: string;
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
  // const [unsupported, setUnsupported] = useState(true);
  const [chains] = useChains();

  const sideBarDefaultWidth = useMemo(() => props.maxWidth || 185, []);
  const { networkId } = useContext<any>(OrderlyContext);

  const checkChainSupportHandle = (chainId: number | string) => {
    return checkChainSupport(
      chainId,
      networkId === "testnet" ? chains.testnet : chains.mainnet
    );
  };

  const onExpandChange = (expand: boolean) => {
    setExpand(expand);
  };

  const footerHeight =
    props.footerHeight !== undefined ? props.footerHeight : 29;

  return (
    <div
      className={cn(
        "oui-flex oui-flex-col",
        "oui-overflow-auto oui-custom-scrollbar",
        classNames?.root
      )}
      style={{
        height: `calc(100vh - ${footerHeight}px)`,
      }}
    >
      <ExpandableContext.Provider
        value={{
          routerAdapter,
          expanded: expand,
          setExpand: onExpandChange,
          // unsupported,
          checkChainSupport: checkChainSupportHandle,
          footerConfig,
          // mainNavProps: props.mainNavProps,
        }}
      >
        {/* Top main nav */}
        <Box
          className={cn(
            "oui-hidden xl:oui-block",
            // "oui-border-b oui-border-line-12",
            classNames?.topNavbar
          )}
        >
          {props.topBar ?? <MainNavWidget {...props.mainNavProps} />}
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
              "oui-box-content oui-transition-all oui-flex xl:oui-grid",
              "oui-flex-1",
              classNames?.body
            )}
            style={{
              // marginBottom: `${props.footerHeight ?? 29}px`,
              gridTemplateColumns: `${
                expand ? sideBarDefaultWidth + "px" : "98px"
              } 1fr`,
              // gridTemplateRows: "auto 1fr",
              // gridTemplateAreas: `"left main" "left main"`,
            }}
          >
            <div className={cn(classNames?.leftSidebar)}>
              {typeof props.leftSidebar !== "undefined" ? (
                props.leftSidebar
              ) : (
                <SideNavbarWidget {...props.leftSideProps} />
              )}
            </div>
            <Box
              width={"100%"}
              className={cn("oui-overflow-hidden", classNames?.content)}
            >
              {props.children}
            </Box>
          </Grid>
          // ---------- left & body layout end ---------
        )}

        <Box
          className={cn(
            "oui-fixed oui-bottom-0 oui-z-50",
            "oui-w-full",
            classNames?.footer
          )}
        >
          {props.footer || <FooterWidget />}
        </Box>
      </ExpandableContext.Provider>
    </div>
  );
};
