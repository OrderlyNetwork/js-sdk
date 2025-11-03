import { FC } from "react";
import { installExtension, ExtensionPositionEnum } from "@orderly.network/ui";
import { StarchildControlPanel } from "@orderly.network/ui-floating-ball";

// Install default StarchildControlPanel into the tail of the main nav
installExtension<void>({
  name: "starchild-control-panel-main-menus",
  scope: ["*"],
  positions: [ExtensionPositionEnum.MainMenus],
  __isInternal: true,
})(() => {
  return <StarchildControlPanel />;
});

// Optional export to allow explicit import if needed elsewhere
export const StarchildControlPanelExtension: FC = () => {
  return <StarchildControlPanel />;
};
