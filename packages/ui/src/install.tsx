import { MainNav, MainNavProps } from "./nav/main/mainNav";
import { useMainNavBuilder } from "./nav/main/widgetBuilder";
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

export {};
