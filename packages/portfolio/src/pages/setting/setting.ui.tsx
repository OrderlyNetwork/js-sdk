import { FC } from "react";
import { SettingScriptReturns } from "./setting.script";
import { useScreen } from "@orderly.network/ui";
import { SettingMobile } from "./setting.ui.mobile";
import { SettingDesktop } from "./setting.ui.desktop";

export const Setting: FC<SettingScriptReturns> = (props) => {
  const { isMobile } = useScreen();
  if (isMobile) {
    return <SettingMobile {...props} />;
  }
  return <SettingDesktop {...props} />;
};
