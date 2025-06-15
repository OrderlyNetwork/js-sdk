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
  return (
    <div className="oui-scaffold-root">
      <header
        className={cn(
          "oui-scaffold-topNavbar",
          "oui-sticky oui-top-0 oui-z-10 oui-w-full oui-bg-base-10",
        )}
      >
        {props.topBar ?? (
          <MainNavMobile
            {...props.mainNavProps}
            routerAdapter={props.routerAdapter}
          />
        )}
      </header>

      <RestrictedInfoWidget className="oui-mx-1 oui-mb-1 oui-bg-base-6" />

      <AnnouncementWidget
        className="oui-mx-1 oui-mb-1 oui-bg-base-6"
        hideTips={props.restrictedInfo?.restrictedOpen}
      />

      <Box
        className="oui-scaffold-content"
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
        // className="oui-hide-scrollbar oui-overflow-y-auto"
      >
        {props.children}
      </Box>

      <footer
        className={cn(
          "oui-scaffold-bottomNav",
          "oui-fixed oui-bottom-0 oui-z-10",
          "oui-w-full oui-bg-base-9 oui-pb-[calc(env(safe-area-inset-bottom))]",
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
