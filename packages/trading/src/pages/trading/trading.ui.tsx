import { FC } from "react";
import { useScreen } from "@veltodefi/ui";
import type { TradingState } from "./trading.script";
import { DesktopLayout } from "./trading.ui.desktop";
import { MobileLayout } from "./trading.ui.mobile";

export const Trading: FC<TradingState> = (props) => {
  const { isMobile } = useScreen();

  if (isMobile) {
    return <MobileLayout {...props} />;
  }

  return (
    <DesktopLayout
      className="oui-h-[calc(100vh_-_48px_-_29px)] oui-bg-base-10"
      {...props}
    />
  );
};
