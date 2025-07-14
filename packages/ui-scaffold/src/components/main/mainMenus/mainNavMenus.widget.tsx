import { FC } from "react";
import {
  ExtensionPositionEnum,
  ExtensionSlot,
  installExtension,
} from "@orderly.network/ui";
import { MainNavMenusUI, type MainNavItemsProps } from "./mainNavMenus.ui";

export const MainNavMenusWidget: FC<MainNavItemsProps> = (props) => {
  return <MainNavMenusUI {...props} />;
};

installExtension<MainNavItemsProps>({
  name: "default-main-nav-menus",
  scope: ["*"],
  positions: [ExtensionPositionEnum.MainMenus],
  __isInternal: true,
})((props: MainNavItemsProps) => {
  return <MainNavMenusUI {...props} />;
});

export const MainNavMenusExtension: FC<MainNavItemsProps> = (props) => {
  return (
    <ExtensionSlot position={ExtensionPositionEnum.MainMenus} {...props} />
  );
};
