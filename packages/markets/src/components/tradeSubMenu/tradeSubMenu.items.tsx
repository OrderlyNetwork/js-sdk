import type { ReactNode } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { useFeatureEnabled } from "@orderly.network/react-app";
import {
  PERP_ROUTE_NAME,
  PREDICTION_ROUTE_NAME,
  perpRoute,
  predictionRoute,
  type RouteOption,
} from "@orderly.network/types";
import {
  PredictionIcon,
  TradingActiveIcon,
  TradingInactiveIcon,
} from "@orderly.network/ui";

/** Key of the built-in Perps entry; only this entry opens the markets panel. */
export const PERPS_TRADE_SUB_MENU_KEY = PERP_ROUTE_NAME;
/** Key of the built-in Prediction entry. */
export const PREDICTION_TRADE_SUB_MENU_KEY = PREDICTION_ROUTE_NAME;

export type TradeSubMenuItem = {
  /** Unique key, matched against `activeKey`. */
  key: string;
  title: string;
  description?: string;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
  /** Destination requested through `onRouteChange` when clicked. */
  route?: RouteOption;
  /** Replaces route navigation when clicked. */
  onClick?: () => void;
};

/** Built-in entries; Prediction is omitted when the app feature is off. */
export function useBuiltinTradeSubMenuItems(
  perpsSymbol: string,
): TradeSubMenuItem[] {
  const { t } = useTranslation();
  const predictionEnabled = useFeatureEnabled("prediction");

  const perps: TradeSubMenuItem = {
    key: PERPS_TRADE_SUB_MENU_KEY,
    title: t("common.perps"),
    description: t("markets.tradeSubMenu.perps.description"),
    activeIcon: <TradingActiveIcon size={20} />,
    inactiveIcon: <TradingInactiveIcon size={20} />,
    route: perpRoute(perpsSymbol),
  };
  if (!predictionEnabled) return [perps];

  return [
    perps,
    {
      key: PREDICTION_TRADE_SUB_MENU_KEY,
      title: t("common.predictions"),
      description: t("prediction.description"),
      activeIcon: <PredictionIcon active size={20} />,
      inactiveIcon: <PredictionIcon size={20} />,
      route: predictionRoute(),
    },
  ];
}
