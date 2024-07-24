import { TradingWidget } from "./trading.widget";
import type { TradingPageProps } from "@orderly.network/react";
import type { ShareOptions } from "../types/share";

export const TradingPage = (
  props: TradingPageProps & { shareOptions: ShareOptions }
) => {
  return <TradingWidget {...props} />;
};
