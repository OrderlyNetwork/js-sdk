import React, { PropsWithChildren } from "react";
import { Box, cn, Grid } from "@orderly.network/ui";
import { MainNavWidget, MainNavWidgetProps } from "./main/mainNav.widget";
import { SideNavbarWidget } from "./sidebar";
import { SideBarProps } from "./sidebar";
import { isValidElement } from "react";
import { RouterAdapter } from "./scaffoldContext";
import { FooterProps, FooterWidget } from "./footer";
import { RestrictedInfoWidget } from "./restrictedInfo";
import { AnnouncementTipsWidget } from "./announcement-tips";
import { ScaffoldProvider } from "./scaffoldProvider";
import { useScaffoldScript } from "./scaffold.script";

export type ScaffoldProps = {
  /**
   * Custom left sidebar component,
   * if provided, the layout will use this component over the default sidebar component
   */
  leftSidebar?: React.ReactNode;
  leftSideProps?: SideBarProps;
  topBar?: React.ReactNode;
  mainNavProps?: MainNavWidgetProps;
  footer?: React.ReactNode;
  footerProps?: FooterProps;
  routerAdapter?: RouterAdapter;
  classNames?: {
    // root = topNavbar + container + footer
    root?: string;
    container?: string;
    content?: string;
    // body = leftSidebar + content
    body?: string;
    leftSidebar?: string;
    topNavbar?: string;
    footer?: string;
  };
};

export const Scaffold = (props: PropsWithChildren<ScaffoldProps>) => {
  const { classNames, footerProps, routerAdapter } = props;

  const {
    topNavbarHeight,
    footerHeight,
    topNavbarRef,
    footerRef,
    announcementRef,
    announcementHeight,
    restrictedInfo,
    expand,
    setExpand,
    isMobile,
  } = useScaffoldScript();

  const sideBarExpandWidth = props.leftSideProps?.maxWidth || 185;
  const sideBarCollaspedWidth = props.leftSideProps?.minWidth || 98;
  const hasLeftSidebar = !!props.leftSidebar;

  const renderContent = () => {
    if (isMobile) {
      return (
        <>
          <div className="oui-fixed oui-left-0 oui-right-0 oui-top-0 oui-z-50">
            <RestrictedInfoWidget className="oui-bg-base-6 oui-mx-1" />

            <AnnouncementTipsWidget
              className="oui-bg-base-6 oui-mx-1"
              hideTips={restrictedInfo?.restrictedOpen}
            />
          </div>
          {props.children}
        </>
      );
    }
    return (
      <div
        style={{
          height: `calc(100vh - ${footerHeight}px)`,
        }}
        className={cn(
          "oui-scaffold-root oui-font-semibold",
          // default text and background color
          "oui-text-base-contrast oui-bg-base-10",
          "oui-flex oui-flex-col",
          "oui-overflow-auto oui-custom-scrollbar",
          classNames?.root
        )}
      >
        {/* topNavbar */}
        <Box
          ref={topNavbarRef}
          className={cn(
            "oui-scaffold-topNavbar oui-bg-base-9",
            classNames?.topNavbar
          )}
        >
          {props.topBar ?? <MainNavWidget {...props.mainNavProps} />}
        </Box>
        <div
          className={cn(
            "oui-scaffold-container",
            "oui-relative oui-h-full",
            // 1024px - 6px (scrollbar widt) = 1018px
            "oui-min-w-[1018px]",
            props.classNames?.container
          )}
        >
          <Box px={3} ref={announcementRef}>
            <RestrictedInfoWidget
              className={cn(
                "oui-scaffold-restricted-info",
                "oui-relative oui-z-[1]",
                "oui-mt-3",
                "oui-bg-base-9",
                // 1024px - 6px (scrollbar widt) - 12 * 2px (padding) = 994px
                "oui-min-w-[994px]"
              )}
            />
            <AnnouncementTipsWidget
              className={cn(
                "oui-scaffold-maintenance-tips",
                "oui-mt-3",
                "oui-relative oui-z-[1]",
                "oui-bg-base-9",
                // 1024px - 6px (scrollbar widt) - 12 * 2px (padding) = 994px
                "oui-min-w-[994px]"
              )}
              hideTips={restrictedInfo.restrictedOpen}
            />
          </Box>

          {/*--------- body start ------ */}
          {!hasLeftSidebar ? (
            // ----------No leftSidebar layout start ---------
            <Box height="100%" className={cn(classNames?.content)}>
              {props.children}
            </Box>
          ) : (
            // ----------No leftSidebar layout end ---------
            // ---------- left & body layout start ---------
            <Grid
              className={cn(
                "oui-box-content oui-transition-all oui-flex xl:oui-grid",
                "oui-flex-1 oui-min-h-full",
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
        </div>

        {/* footer */}
        <Box
          ref={footerRef}
          className={cn(
            "oui-scaffold-footer oui-w-full oui-bg-base-10",
            "oui-fixed oui-bottom-0 oui-z-50",
            "oui-border-t-[1px] oui-border-line-12",
            classNames?.footer
          )}
        >
          {props.footer || <FooterWidget {...footerProps} />}
        </Box>
      </div>
    );
  };

  return (
    <ScaffoldProvider
      routerAdapter={routerAdapter}
      expanded={expand}
      setExpand={setExpand}
      topNavbarHeight={topNavbarHeight}
      footerHeight={footerHeight}
      announcementHeight={announcementHeight}
    >
      {renderContent()}
    </ScaffoldProvider>
  );
};
