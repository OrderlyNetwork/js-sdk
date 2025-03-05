import { Box, cn, Grid, useScreen } from "@orderly.network/ui";
import { MainNavWidget, MainNavWidgetProps } from "./main/mainNav.widget";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SideNavbarWidget } from "./sidebar";
import { SideBarProps } from "./sidebar";
import {
  OrderlyContext,
  useChains,
  useLocalStorage,
} from "@orderly.network/hooks";
import { isValidElement } from "react";
import { ExpandableContext, RouterAdapter } from "./scaffoldContext";
import { checkChainSupport } from "../utils/chain";
import { FooterProps, FooterWidget } from "./footer";
import { MaintenanceTipsWidget } from "./maintenanceTips";
import { RestrictedInfoWidget } from "./restrictedInfo";

export type LayoutProps = {
  /**
   * Custom left sidebar component,
   * if provided, the layout will use this component over the default sidebar component
   */
  gap?: number;
  leftSidebar?: React.ReactNode;
  leftSideProps?: SideBarProps;
  // rightSidebar?: React.ReactNode;
  topBar?: React.ReactNode;
  // topBarProps?:
  mainNavProps?: MainNavWidgetProps;
  footer?: React.ReactNode;
  footerProps?: FooterProps;
  routerAdapter?: RouterAdapter;
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
  const { classNames, footerProps, routerAdapter } = props;
  const [footerHeight, setFooterHeight] = useState(29);
  const footerRef = useRef<HTMLDivElement>(null);
  const [expand, setExpand] = useLocalStorage(
    "orderly_scaffold_expanded",
    true
  );
  const [chains] = useChains();

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

  useEffect(() => {
    if (!footerRef) {
      return;
    }

    const height = footerRef.current?.getBoundingClientRect().height;
    setFooterHeight(height!);
  }, [footerRef]);

  const sideBarExpandWidth = props.leftSideProps?.maxWidth || 185;
  const sideBarCollaspedWidth = props.leftSideProps?.minWidth || 98;

  const hasLeftSidebar = !!props.leftSidebar;
  const { isMobile } = useScreen();

  return (
    <div
      className={cn(
        "oui-scaffold-root oui-font-semibold",
        // default text and background color
        "oui-text-base-contrast oui-bg-base-10",
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
          checkChainSupport: checkChainSupportHandle,
        }}
      >
        {/* Top main nav */}
        <Box
          className={cn(
            "oui-scaffold-topNavbar oui-bg-base-9",
            "oui-hidden lg:oui-block",
            // 1024px - 6px (scrollbar widt) = 1018px
            "oui-min-w-[1018px]",
            // "oui-border-b oui-border-line-12",
            classNames?.topNavbar
          )}
        >
          {props.topBar ?? <MainNavWidget {...props.mainNavProps} />}
        </Box>
        <div
          className={cn(
            "oui-scaffold-maintenance-tips",
            "oui-hidden lg:oui-block",
            // 1024px - 6px (scrollbar widt) = 1018px
            "oui-min-w-[1018px]"
          )}
        >
          {!isMobile && <MaintenanceTipsWidget />}
        </div>

        <RestrictedInfoWidget
          className={cn(
            "oui-mx-3 oui-mt-3",
            "oui-hidden lg:oui-block",
            // 1024px - 6px (scrollbar widt) - 12 * 2 = 994px
            "oui-min-w-[994px]"
          )}
        />

        {/*--------- body start ------ */}
        {!hasLeftSidebar ? (
          // ----------No leftSidebar layout start ---------
          <Box height="100%" className={classNames?.content}>
            {props.children}
          </Box>
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
              gridTemplateColumns: `${
                expand
                  ? `${sideBarExpandWidth}px`
                  : `${sideBarCollaspedWidth}px`
              } 1fr`,
              // gridTemplateRows: "auto 1fr",
              // gridTemplateAreas: `"left main" "left main"`,
            }}
          >
            <div className={cn(classNames?.leftSidebar)}>
              {/* {typeof props.leftSidebar !== "undefined" ? ( */}
              {isValidElement(props.leftSidebar) ? (
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
          ref={footerRef}
          className={cn(
            "oui-scaffold-footer oui-w-full oui-bg-base-10",
            "oui-fixed oui-bottom-0 oui-z-50",
            "oui-hidden lg:oui-flex",
            "oui-border-t-[1px] oui-border-line-12",
            classNames?.footer
          )}
        >
          {props.footer || <FooterWidget {...footerProps} />}
        </Box>
      </ExpandableContext.Provider>
    </div>
  );
};
