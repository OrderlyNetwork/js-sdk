import { useScreen } from "@orderly.network/ui";
import { useChainMenuScript } from "./chainMenu.script";
import { ChainMenu } from "./chainMenu.ui";
import { ChainMenuUiMobile } from "./chainMenu.ui.mobile";

export const ChainMenuWidget = () => {
  const state = useChainMenuScript();
  const { isMobile } = useScreen();
  if (isMobile) {
    return <ChainMenuUiMobile {...state} />;
  }
  return <ChainMenu {...state} />;
};
