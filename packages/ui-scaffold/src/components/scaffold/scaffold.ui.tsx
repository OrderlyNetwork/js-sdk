import { FC, PropsWithChildren } from "react";
import { Box, cn, Grid } from "@orderly.network/ui";
import { MainNavWidget } from "../main/mainNav.widget";
import { SideNavbarWidget } from "../sidebar";
import { isValidElement } from "react";
import { FooterWidget } from "../footer";
import { RestrictedInfoWidget } from "../restrictedInfo";
import { AnnouncementWidget } from "../announcement";
import { ScaffoldScriptReturn } from "./scaffold.script";
import { ScaffoldProps } from "./scaffold.widget";

export type DesktopScaffoldProps = PropsWithChildren<
  ScaffoldProps & ScaffoldScriptReturn
>;

export const DesktopScaffold: FC<DesktopScaffoldProps> = (props) => {
  const { classNames } = props;
  return (
    <div
      style={{
        height: `calc(100vh - ${props.footerHeight}px)`,
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
        ref={props.topNavbarRef}
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
          classNames?.container
        )}
      >
        <Box px={3} ref={props.announcementRef}>
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
          <AnnouncementWidget
            className={cn(
              "oui-scaffold-maintenance-tips",
              "oui-mt-3",
              "oui-relative oui-z-[1]",
              "oui-bg-base-9",
              // 1024px - 6px (scrollbar widt) - 12 * 2px (padding) = 994px
              "oui-min-w-[994px]"
            )}
            hideTips={props.restrictedInfo?.restrictedOpen}
          />
        </Box>

        {/*--------- body start ------ */}
        {!props.hasLeftSidebar ? (
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
                props.expand
                  ? `${props.sideBarExpandWidth}px`
                  : `${props.sideBarCollaspedWidth}px`
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
        ref={props.footerRef}
        className={cn(
          "oui-scaffold-footer oui-w-full oui-bg-base-10",
          "oui-fixed oui-bottom-0 oui-z-50",
          "oui-border-t-[1px] oui-border-line-12",
          classNames?.footer
        )}
      >
        {props.footer || <FooterWidget {...props.footerProps} />}
      </Box>
    </div>
  );
};
