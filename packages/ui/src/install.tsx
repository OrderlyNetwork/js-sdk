import { MainNav, MainNavProps } from "./nav/main/mainNav";
import { useMainNavBuilder } from "./nav/main/widgetBuilder";
import { SideBar } from "./nav/sidebar";
import { useSideNavBuilder } from "./nav/sidebar/builders/useSideNavBuilder";
import { SideBarProps } from "./nav/sidebar/sidebar";
import { installExtension } from "./plugin/install";
import { ExtensionPositionEnum } from "./plugin/types";

installExtension<MainNavProps>({
  name: "main-navbar",
  scope: ["*"],
  positions: [ExtensionPositionEnum.MainNav],
  builder: useMainNavBuilder,
  __isInternal: true,
})((props) => {
  return <MainNav {...props} />;
});

installExtension<SideBarProps>({
  name: "side-navbar",
  scope: ["*"],
  positions: [ExtensionPositionEnum.SideNav],
  builder: useSideNavBuilder,
  __isInternal: true,
})(SideBar);

export {};
