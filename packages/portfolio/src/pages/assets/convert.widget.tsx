import { useScreen } from "@orderly.network/ui";
import { useConvertScript } from "./convert.script";
import { ConvertDesktopUI } from "./convert.ui.desktop";
import { ConvertMobileUI } from "./convert.ui.mobile";

export const ConvertHistoryWidget = () => {
  const convertState = useConvertScript();
  const { isMobile } = useScreen();

  if (isMobile) {
    return <ConvertMobileUI convertState={convertState} />;
  }

  return <ConvertDesktopUI convertState={convertState} />;
};
