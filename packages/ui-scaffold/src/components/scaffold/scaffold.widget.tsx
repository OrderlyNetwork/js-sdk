import React, { PropsWithChildren } from "react";
import { BottomNavProps } from "../bottomNav/bottomNav.widget";
import { FooterProps } from "../footer";
import { MainNavWidgetProps } from "../main/mainNav.widget";
import { SideBarProps } from "../sidebar";
import { MobileScaffold } from "./scaffold.mobile.ui";
import { useScaffoldScript } from "./scaffold.script";
import { DesktopScaffold } from "./scaffold.ui";
import { RouterAdapter } from "./scaffoldContext";
import { ScaffoldProvider } from "./scaffoldProvider";

export type ScaffoldProps = {
  /**
   * Custom left sidebar component,
   * if provided, the layout will use this component over the default sidebar component
   */
  leftSidebar?: React.ReactNode;
  leftSideProps?: SideBarProps;
  topBar?: React.ReactNode;
  mainNavProps?: MainNavWidgetProps;
  bottomNavProps?: BottomNavProps;
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
  const state = useScaffoldScript(props);

  const renderContent = () => {
    if (state.isMobile) {
      return <MobileScaffold {...state}>{props.children}</MobileScaffold>;
    }

    return (
      <DesktopScaffold {...props} {...state}>
        {props.children}
      </DesktopScaffold>
    );
  };

  return (
    <ScaffoldProvider
      routerAdapter={props.routerAdapter}
      expanded={state.expand}
      setExpand={state.setExpand}
      topNavbarHeight={state.topNavbarHeight}
      footerHeight={state.footerHeight}
      announcementHeight={state.announcementHeight}
    >
      {renderContent()}
    </ScaffoldProvider>
  );
};
