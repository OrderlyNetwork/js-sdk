/**
 * Trading desktop split layout: nested SplitLayoutModel for default and max2XL variants.
 * Used as initialLayout for LayoutHost with splitStrategy so layout is strategy-driven.
 */
import type {
  SplitLayoutModel,
  SplitLayoutNode,
} from "@orderly.network/layout-split";
import { TRADING_PANEL_IDS } from "./TradingPanelRegistry";

/** Options for creating the trading desktop layout (sizes from persistence or defaults) */
export interface CreateTradingDesktopLayoutOptions {
  /** Main split: orderEntry vs main column (e.g. "30%" or "280px") */
  mainSplitSize?: string;
  /** Orderbook vs tradingView horizontal split (e.g. "40%" or "280px") */
  orderBookSplitSize?: string;
  /** DataList vs trading+orderbook vertical split (e.g. "30%" or "350px") */
  dataListSplitSize?: string;
}

const DEFAULT_MAIN_SPLIT = "30%";
const DEFAULT_ORDERBOOK_SPLIT = "40%";
const DEFAULT_DATALIST_SPLIT = "30%";

/**
 * Normalize size to percentage for second pane when first is percentage; else leave flexible.
 */
function secondSize(first: string): string {
  const n = parseFloat(first);
  if (Number.isNaN(n) || !first.endsWith("%")) return "auto";
  return `${100 - n}%`;
}

/**
 * Build the main column subtree: symbolInfoBar + (tradingView|orderbook | dataList).
 * Used for default (large screen) layout.
 */
function mainColumnNode(
  orderBookSplitSize: string,
  dataListSplitSize: string,
): SplitLayoutNode {
  const tradingOrderbook: SplitLayoutNode = {
    type: "split",
    mode: "horizontal",
    children: [
      { type: "panel", panelId: TRADING_PANEL_IDS.TRADING_VIEW },
      { type: "panel", panelId: TRADING_PANEL_IDS.ORDERBOOK },
    ],
    sizes: [orderBookSplitSize, secondSize(orderBookSplitSize)],
  };
  const content: SplitLayoutNode = {
    type: "split",
    mode: "vertical",
    children: [
      tradingOrderbook,
      { type: "panel", panelId: TRADING_PANEL_IDS.DATA_LIST },
    ],
    sizes: [dataListSplitSize, secondSize(dataListSplitSize)],
  };
  return {
    type: "split",
    mode: "vertical",
    children: [
      { type: "panel", panelId: TRADING_PANEL_IDS.SYMBOL_INFO_BAR },
      content,
    ],
  };
}

/**
 * Creates the default (large screen) trading desktop split layout.
 * Root: horizontal [ mainColumn | orderEntry ] or [ orderEntry | mainColumn ] depending on layoutSide.
 */
function createDefaultVariant(
  layoutSide: "left" | "right",
  options: CreateTradingDesktopLayoutOptions,
): SplitLayoutModel {
  const mainSplit = options.mainSplitSize ?? DEFAULT_MAIN_SPLIT;
  const orderBookSplit = options.orderBookSplitSize ?? DEFAULT_ORDERBOOK_SPLIT;
  const dataListSplit = options.dataListSplitSize ?? DEFAULT_DATALIST_SPLIT;

  const mainCol = mainColumnNode(orderBookSplit, dataListSplit);
  const orderEntry = {
    type: "panel" as const,
    panelId: TRADING_PANEL_IDS.ORDER_ENTRY,
  };

  /* mainSplitSize from persistence is the order-entry pane size */
  const orderEntrySize = mainSplit;
  const mainColSize = secondSize(mainSplit);

  const root: SplitLayoutNode =
    layoutSide === "left"
      ? {
          type: "split",
          mode: "horizontal",
          children: [orderEntry, mainCol],
          sizes: [orderEntrySize, mainColSize],
        }
      : {
          type: "split",
          mode: "horizontal",
          children: [mainCol, orderEntry],
          sizes: [mainColSize, orderEntrySize],
        };

  return { root };
}

/**
 * Creates the max2XL (smaller desktop) layout: vertical [ symbolInfoBar | (trading|orderbook + orderEntry) | dataList ].
 * Three rows: symbol bar, then horizontal(trading+orderbook, orderEntry), then dataList.
 */
function createMax2XLVariant(
  layoutSide: "left" | "right",
  options: CreateTradingDesktopLayoutOptions,
): SplitLayoutModel {
  const dataListSplit = options.dataListSplitSize ?? DEFAULT_DATALIST_SPLIT;
  const orderBookSplit = options.orderBookSplitSize ?? DEFAULT_ORDERBOOK_SPLIT;
  // Use mainSplitSize if provided, otherwise default to 280px for order entry
  const orderEntrySize = options.mainSplitSize ?? "280px";

  const tradingOrderbook: SplitLayoutNode = {
    type: "split",
    mode: "vertical",
    children: [
      { type: "panel", panelId: TRADING_PANEL_IDS.TRADING_VIEW },
      { type: "panel", panelId: TRADING_PANEL_IDS.ORDERBOOK },
    ],
    sizes: [orderBookSplit, secondSize(orderBookSplit)],
  };

  const orderEntry = {
    type: "panel" as const,
    panelId: TRADING_PANEL_IDS.ORDER_ENTRY,
  };
  // Sizes array must match children order: [firstChildSize, secondChildSize]
  const middleRowSizes =
    layoutSide === "left"
      ? [orderEntrySize, secondSize(orderEntrySize)]
      : [secondSize(orderEntrySize), orderEntrySize];
  const middleRow: SplitLayoutNode = {
    type: "split",
    mode: "horizontal",
    children:
      layoutSide === "left"
        ? [orderEntry, tradingOrderbook]
        : [tradingOrderbook, orderEntry],
    sizes: middleRowSizes,
  };

  const root: SplitLayoutNode = {
    type: "split",
    mode: "vertical",
    children: [
      { type: "panel", panelId: TRADING_PANEL_IDS.SYMBOL_INFO_BAR },
      middleRow,
      { type: "panel", panelId: TRADING_PANEL_IDS.DATA_LIST },
    ],
    sizes: ["auto", "auto", dataListSplit],
  };

  return { root };
}

/**
 * Creates a SplitLayoutModel for the trading desktop.
 * Use as initialLayout with splitStrategy; persist with storageKey and migrate from legacy keys if needed.
 *
 * @param variant - "default" for large screen (orderEntry + main column), "max2XL" for smaller desktop
 * @param layoutSide - "left" | "right" for order entry position (default variant only)
 * @param options - Optional sizes from persistence (mainSplitSize, orderBookSplitSize, dataListSplitSize)
 * @returns SplitLayoutModel
 */
export function createTradingDesktopLayout(
  variant: "default" | "max2XL",
  layoutSide: "left" | "right",
  options?: CreateTradingDesktopLayoutOptions,
): SplitLayoutModel {
  if (variant === "max2XL") {
    return createMax2XLVariant(layoutSide, options ?? {});
  }
  return createDefaultVariant(layoutSide, options ?? {});
}
