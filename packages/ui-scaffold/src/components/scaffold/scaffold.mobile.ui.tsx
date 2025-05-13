import { PropsWithChildren } from "react";
import { AnnouncementWidget } from "../announcement";
import { FooterMobile } from "../footer";
import { MobileTopNav } from "../main/mobileTopNav.ui";
import { RestrictedInfoWidget } from "../restrictedInfo";
import { ScaffoldScriptReturn } from "./scaffold.script";

type MobileScaffoldProps = PropsWithChildren<ScaffoldScriptReturn>;

export const MobileScaffold = (props: MobileScaffoldProps) => {
  return (
    <>
      <header className="oui-sticky oui-top-0 oui-z-10 oui-w-full oui-bg-base-10">
        <MobileTopNav
          {...props.mainNavProps}
          routerAdapter={props.routerAdapter}
        />
      </header>
      <RestrictedInfoWidget className="oui-mx-1 oui-mb-1 oui-bg-base-6" />

      <AnnouncementWidget
        className="oui-mx-1 oui-mb-1 oui-bg-base-6"
        hideTips={props.restrictedInfo?.restrictedOpen}
      />

      {props.children}

      <footer className="oui-fixed oui-bottom-0 oui-z-10 oui-w-full oui-bg-base-9 oui-pb-[calc(env(safe-area-inset-bottom))]">
        <FooterMobile
          mainMenus={props.footerProps?.mobileMainMenus}
          current={
            Array.isArray(props.mainNavProps?.initialMenu)
              ? "/"
              : props.mainNavProps?.initialMenu
          }
          onRouteChange={props.routerAdapter?.onRouteChange}
        />
      </footer>
    </>
  );
};
