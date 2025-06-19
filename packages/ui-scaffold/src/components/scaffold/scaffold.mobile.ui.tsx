import { PropsWithChildren } from "react";
import { Box, cn } from "@orderly.network/ui";
import { AnnouncementWidget } from "../announcement";
import { BottomNav } from "../bottomNav/bottomNav.ui.mobile";
import { MainNavMobile } from "../main/mainNav.ui.mobile";
import { RestrictedInfoWidget } from "../restrictedInfo";
import { ScaffoldScriptReturn } from "./scaffold.script";
import { ScaffoldProps } from "./scaffold.widget";

type MobileScaffoldProps = PropsWithChildren<
  ScaffoldScriptReturn & ScaffoldProps
>;

export const MobileScaffold = (props: MobileScaffoldProps) => {
  const { classNames } = props;
  return (
    <div
      style={{ paddingBottom: props.bottomNavHeight }}
      className={cn(
        "oui-scaffold-root oui-w-full oui-overflow-hidden oui-bg-base-10",
        // "oui-custom-scrollbar oui-overflow-y-auto",
        classNames?.root,
      )}
    >
      <header
        ref={props.topNavbarRef}
        className={cn(
          "oui-scaffold-topNavbar",
          "oui-sticky oui-top-0 oui-z-10 oui-w-full oui-bg-base-10",
          classNames?.topNavbar,
        )}
      >
        {props.topBar ?? (
          <MainNavMobile
            {...props.mainNavProps}
            routerAdapter={props.routerAdapter}
          />
        )}
      </header>

      <Box
        // style={{
        //   height: `calc(100vh - ${props.topNavbarHeight}px - ${props.bottomNavHeight}px)`,
        // }}
        className={cn(
          "oui-scaffold-container",
          // "oui-relative",
          // "oui-custom-scrollbar oui-overflow-y-auto",
          // "oui-pb-[calc(env(safe-area-inset-bottom,64px))]",
          classNames?.container,
        )}
      >
        <RestrictedInfoWidget className="oui-mx-1 oui-mb-1 oui-bg-base-6" />

        <AnnouncementWidget
          className="oui-mx-1 oui-mb-1 oui-bg-base-6"
          hideTips={props.restrictedInfo?.restrictedOpen}
        />

        <Box
          height="100%"
          width="100%"
          className={cn("oui-scaffold-content", classNames?.content)}
        >
          {props.children}
        </Box>
      </Box>

      <footer
        ref={props.bottomNavRef}
        className={cn(
          "oui-scaffold-bottomNav",
          "oui-fixed oui-bottom-0 oui-z-10",
          "oui-w-full oui-bg-base-9",
          classNames?.bottomNav,
        )}
      >
        {props.bottomNav ?? (
          <BottomNav
            mainMenus={props?.bottomNavProps?.mainMenus}
            current={
              props?.bottomNavProps?.current || props?.mainNavProps?.initialMenu
            }
            onRouteChange={props.routerAdapter?.onRouteChange}
          />
        )}
      </footer>
    </div>
  );
};
