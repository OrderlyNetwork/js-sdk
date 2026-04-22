import { FC } from "react";
import { injectable } from "@orderly.network/ui";
import { MainNavMenus, type MainNavItemsProps } from "./mainNavMenus.ui";

/** Default nav menus component - can be intercepted by plugins via Layout.MainMenus path */
const InjectableMainNavMenus = injectable(MainNavMenus, "Layout.MainMenus");

export const MainNavMenusWidget: FC<MainNavItemsProps> = (props) => {
  return <MainNavMenus {...props} />;
};

/**
 * Extension slot for main nav menus. Uses injectable pattern - plugins can
 * register interceptors for 'Layout.MainMenus' via OrderlyPluginProvider.
 */
export const MainNavMenusExtension: FC<MainNavItemsProps> = (props) => {
  return <InjectableMainNavMenus {...props} />;
};
