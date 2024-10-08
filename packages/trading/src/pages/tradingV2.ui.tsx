import { FC } from "react";
import { TradingV2State } from "./tradingV2.script";
import { useMediaQuery } from "@orderly.network/hooks";
import { MobileLayout } from "./tradingV2.ui.mobile";
import { DesktopLayout } from "./tradingV2.ui.desktop";

export const TradingV2: FC<TradingV2State> = (props) => {
  const isMobileLayout = useMediaQuery(props.tabletMediaQuery);

  return isMobileLayout ? (
    <MobileLayout {...props} />
  ) : (
    <DesktopLayout {...props} />
  );
};
