import { PropsWithChildren } from "react";
import { Box } from "@orderly.network/ui";
import { AnnouncementWidget } from "../announcement";
import { BottomNav } from "../bottomNav/bottomNav.ui.mobile";
import { MainNavMobile } from "../main/mainNav.ui.mobile";
import { RestrictedInfoWidget } from "../restrictedInfo";
import { ScaffoldScriptReturn } from "./scaffold.script";

type MobileScaffoldProps = PropsWithChildren<ScaffoldScriptReturn>;

export const MobileScaffold = (props: MobileScaffoldProps) => {
  return (
    <>
      <header className="oui-sticky oui-top-0 oui-z-10 oui-w-full oui-bg-base-10">
        <MainNavMobile
          {...props.mainNavProps}
          routerAdapter={props.routerAdapter}
        />
      </header>
      <RestrictedInfoWidget className="oui-mx-1 oui-mb-1 oui-bg-base-6" />

      <AnnouncementWidget
        className="oui-mx-1 oui-mb-1 oui-bg-base-6"
        hideTips={props.restrictedInfo?.restrictedOpen}
      />

      <Box
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
        // className="oui-hide-scrollbar oui-overflow-y-auto"
      >
        {props.children}
      </Box>

      <footer className="oui-fixed oui-bottom-0 oui-z-10 oui-w-full oui-bg-base-9 oui-pb-[calc(env(safe-area-inset-bottom))]">
        <BottomNav
          mainMenus={props?.bottomNavProps?.mainMenus}
          current={
            props?.bottomNavProps?.current || props?.mainNavProps?.initialMenu
          }
          onRouteChange={props.routerAdapter?.onRouteChange}
        />
      </footer>
    </>
  );
};
