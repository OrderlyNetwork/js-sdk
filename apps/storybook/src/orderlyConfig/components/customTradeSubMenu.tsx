import React, { useCallback } from "react";
import { useLocation, useParams } from "react-router";
import { removeLangPrefix, useTranslation } from "@orderly.network/i18n";
import {
  PERPS_TRADE_SUB_MENU_KEY,
  PREDICTION_TRADE_SUB_MENU_KEY,
  TradeSubMenuWidget,
  type TradeSubMenuItem,
} from "@orderly.network/markets";
import { MarketsActiveIcon, MarketsInactiveIcon } from "@orderly.network/ui";
import { PathEnum } from "../../playground/constant";
import { DEFAULT_SYMBOL } from "../../playground/perpSymbolStorage";

const SPOT_KEY = "spot";
const RWA_KEY = "rwa";

function matchesRoute(path: string, route: string) {
  return path === route || path.startsWith(`${route}/`);
}

/** Expects a pathname without the language prefix. */
function getTradeSubMenuKey(path: string): string {
  if (matchesRoute(path, PathEnum.Prediction)) {
    return PREDICTION_TRADE_SUB_MENU_KEY;
  }
  if (matchesRoute(path, PathEnum.Swap)) return SPOT_KEY;
  if (matchesRoute(path, PathEnum.Rwa)) return RWA_KEY;
  return PERPS_TRADE_SUB_MENU_KEY;
}

const TradeSubMenu: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const params = useParams();
  const path = removeLangPrefix(pathname);

  const items = useCallback(
    (builtins: TradeSubMenuItem[]): TradeSubMenuItem[] => {
      // const spot: TradeSubMenuItem = {
      //   key: SPOT_KEY,
      //   title: t("extend.spot"),
      //   description: t("extend.spot.description"),
      //   activeIcon: <EarnActiveIcon size={20} />,
      //   inactiveIcon: <EarnInactiveIcon size={20} />,
      //   route: { href: PathEnum.Swap, name: SPOT_KEY },
      // };
      const rwa: TradeSubMenuItem = {
        key: RWA_KEY,
        title: t("common.rwa"),
        description: t("common.rwa"),
        activeIcon: <MarketsActiveIcon size={20} />,
        inactiveIcon: <MarketsInactiveIcon size={20} />,
        route: { href: PathEnum.Rwa, name: RWA_KEY },
      };
      return [...builtins, rwa];
    },
    [t],
  );

  return (
    <TradeSubMenuWidget
      activeKey={getTradeSubMenuKey(path)}
      // Prediction round symbols are ignored inside the widget via isBinarySymbol.
      symbol={params.symbol}
      defaultSymbol={DEFAULT_SYMBOL}
      items={items}
    />
  );
};

export const customTradeSubMenuRender = () => <TradeSubMenu />;
