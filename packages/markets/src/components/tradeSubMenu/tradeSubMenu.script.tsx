import { useCallback, useState } from "react";
import { useAppContext } from "@orderly.network/react-app";
import { perpRoute, type API } from "@orderly.network/types";
import { getStoredPerpSymbol, isBinarySymbol } from "@orderly.network/utils";
import {
  PERPS_TRADE_SUB_MENU_KEY,
  useBuiltinTradeSubMenuItems,
  type TradeSubMenuItem,
} from "./tradeSubMenu.items";

export const DEFAULT_TRADE_SUB_MENU_SYMBOL = "PERP_ETH_USDC";

export type TradeSubMenuScriptOptions = {
  /** Controls the highlighted entry. The host updates it from its route; defaults to `"perps"`. */
  activeKey?: string;
  /**
   * Perps symbol of the current page. Prediction round symbols are ignored:
   * a round is not a Perps market. Without a usable symbol the remembered one
   * (`getStoredPerpSymbol`) is used.
   */
  symbol?: string;
  /** Used when no symbol is passed or remembered. Defaults to `PERP_ETH_USDC`. */
  defaultSymbol?: string;
  /**
   * Customizes the entries. Receives the built-in Perps and Prediction items
   * and returns the final list, e.g. to insert Spot or reorder entries.
   */
  items?: (builtins: TradeSubMenuItem[]) => TradeSubMenuItem[];
  /** Overrides navigation for markets picked in the panel; defaults to `/perp/:symbol` via `onRouteChange`. */
  onSymbolChange?: (symbol: API.Symbol) => void;
};

export type TradeSubMenuScriptReturn = ReturnType<typeof useTradeSubMenuScript>;

export function useTradeSubMenuScript(options: TradeSubMenuScriptOptions = {}) {
  const {
    activeKey = PERPS_TRADE_SUB_MENU_KEY,
    symbol,
    defaultSymbol = DEFAULT_TRADE_SUB_MENU_SYMBOL,
    items: customizeItems,
    onSymbolChange: hostOnSymbolChange,
  } = options;
  const { onRouteChange } = useAppContext();
  // Read once per mount: the nav popover remounts the menu on every open.
  const [storedSymbol] = useState(getStoredPerpSymbol);
  const pageSymbol = symbol && !isBinarySymbol(symbol) ? symbol : undefined;
  const perpsSymbol = pageSymbol || storedSymbol || defaultSymbol;
  const builtins = useBuiltinTradeSubMenuItems(perpsSymbol);
  const items = customizeItems ? customizeItems(builtins) : builtins;

  // Without a hover override, the current route controls the panel.
  const [isMarketsHovered, setIsMarketsHovered] = useState<boolean | null>(
    null,
  );

  const hasMarkets = items.some(
    (item) => item.key === PERPS_TRADE_SUB_MENU_KEY,
  );
  const marketsOpen =
    hasMarkets && (isMarketsHovered ?? activeKey === PERPS_TRADE_SUB_MENU_KEY);

  const onItemClick = useCallback(
    (item: TradeSubMenuItem) => {
      if (item.onClick) item.onClick();
      else if (item.route) onRouteChange?.(item.route);
    },
    [onRouteChange],
  );

  const onSymbolChange = useCallback(
    (market: API.Symbol) => {
      if (hostOnSymbolChange) hostOnSymbolChange(market);
      else onRouteChange?.(perpRoute(market.symbol));
    },
    [hostOnSymbolChange, onRouteChange],
  );

  const onItemHover = useCallback(
    (key: string) => setIsMarketsHovered(key === PERPS_TRADE_SUB_MENU_KEY),
    [],
  );
  const onMarketsHover = useCallback(() => setIsMarketsHovered(true), []);
  const onMenuLeave = useCallback(() => setIsMarketsHovered(null), []);

  return {
    items,
    activeKey,
    hasMarkets,
    marketsOpen,
    perpsSymbol,
    onItemClick,
    onItemHover,
    onMarketsHover,
    onMenuLeave,
    onSymbolChange,
  };
}
