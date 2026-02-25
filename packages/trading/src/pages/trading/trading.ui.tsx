import { FC } from "react";
import { useScreen } from "@orderly.network/ui";
import { InjectableDesktopLayout } from "./trading.injectable";
import type { TradingState } from "./trading.script";
import { MobileLayout } from "./trading.ui.mobile";

/** Injectable so layout plugins can intercept and replace desktop layout via renderContent */

export const Trading: FC<TradingState> = (props) => {
  const { isMobile } = useScreen();

  if (isMobile) {
    return <MobileLayout {...props} />;
  }

  return (
    <InjectableDesktopLayout
      className="oui-h-[calc(100vh_-_48px_-_29px)] oui-bg-base-10"
      {...props}
    />
  );
};
