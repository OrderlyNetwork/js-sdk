import { useScreen } from "@orderly.network/ui";
import { HistoryDataGroupDesktop } from "./historyDataGroup.ui.desktop";
import { HistoryDataGroupMobile } from "./historyDataGroup.ui.mobile";
import { useStateScript } from "./useState.script";

export const HistoryDataGroupWidget = () => {
  const state = useStateScript();
  const { isMobile } = useScreen();
  if (isMobile) {
    return <HistoryDataGroupMobile {...state} />;
  }
  return <HistoryDataGroupDesktop {...state} />;
};
