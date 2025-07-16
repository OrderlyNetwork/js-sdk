import { FC } from "react";
import {
  ExtensionPositionEnum,
  ExtensionSlot,
  installExtension,
} from "@orderly.network/ui";
import { MainNavMenus, type MainNavItemsProps } from "./mainNavMenus.ui";

export const MainNavMenusWidget: FC<MainNavItemsProps> = (props) => {
  return <MainNavMenus {...props} />;
};

installExtension<MainNavItemsProps>({
  name: "default-main-nav-menus",
  scope: ["*"],
  positions: [ExtensionPositionEnum.MainMenus],
  __isInternal: true,
})((props: MainNavItemsProps) => {
  return <MainNavMenus {...props} />;
});

export const MainNavMenusExtension: FC<MainNavItemsProps> = (props) => {
  return (
    <ExtensionSlot position={ExtensionPositionEnum.MainMenus} {...props} />
  );
};
