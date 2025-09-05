import React, { PropsWithChildren } from "react";
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

export const MobileScaffold: React.FC<MobileScaffoldProps> = (props) => {
  const { classNames } = props;
  return (
    <div
      style={{
        // only effective on real device, 12px is extra padding
        paddingBottom: `calc(${props.bottomNavHeight}px + 12px + env(safe-area-inset-bottom))`,
      }}
      className={cn(
        "oui-scaffold-root oui-w-full oui-bg-base-10",
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
        className={cn(
          "oui-scaffold-container oui-overflow-hidden",
          // "oui-relative",
          // "oui-custom-scrollbar oui-overflow-y-auto",
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
          // only effective on real device
          "oui-pb-[calc(env(safe-area-inset-bottom))]",
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
