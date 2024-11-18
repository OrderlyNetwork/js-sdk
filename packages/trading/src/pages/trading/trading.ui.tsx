import { FC } from "react";
import { TradingState } from "./trading.script";
import { MobileLayout } from "./trading.ui.mobile";
import { DesktopLayout } from "./trading.ui.desktop";
import { useScreen } from "@orderly.network/ui";

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
