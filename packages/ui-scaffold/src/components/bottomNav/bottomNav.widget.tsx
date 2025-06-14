import { ReactNode } from "react";
import { useScreen } from "@orderly.network/ui";
import { RouterAdapter } from "../scaffold";
import { BottomNav } from "./bottomNav.ui.mobile";

export type BottomNavProps = {
  mainMenus?: BottomNavItem[];
  current?: string;
  onRouteChange?: RouterAdapter["onRouteChange"];
};

export type BottomNavItem = {
  name: string;
  href: string;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
};

export const BottomNavWidget = (props: BottomNavProps) => {
  const { isMobile } = useScreen();
  const { mainMenus, ...rest } = props;
  return isMobile ? <BottomNav mainMenus={mainMenus} {...rest} /> : null;
};
