import { FC } from "react";
import { MainNavMenusUI, type MainNavItemsProps } from "./mainNavMenus.ui";
import { ExtensionPositionEnum, ExtensionSlot } from "@orderly.network/ui";

export const MainNavMenusWidget: FC<MainNavItemsProps> = (props) => {
  return <MainNavMenusUI {...props} />;
};

export const MainNavMenusExtension: FC<MainNavItemsProps> = (props) => {
  return (
    <ExtensionSlot position={ExtensionPositionEnum.MainMenus} {...props} />
  );
};
