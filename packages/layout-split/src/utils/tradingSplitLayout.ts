/**
 * Default trading split layout for LayoutHost with splitStrategy.
 * Uses TRADING_PANEL_IDS from layout-core; component mapping is in the trading package.
 */
import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type { SplitLayoutModel, SplitLayoutNode } from "../types";

/** Options for creating the trading split layout (sizes from persistence or defaults) */
export interface TradingSplitLayoutOptions {
  /** "default" for large screen (orderEntry + main column), "max2XL" for smaller desktop */
  variant?: "default" | "max2XL";
  /** "left" | "right" for order entry position */
  layoutSide?: "left" | "right";
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
 * Creates the default (large screen) trading split layout.
 * Root: horizontal [ mainColumn | orderEntry ] or [ orderEntry | mainColumn ] depending on layoutSide.
 */
function createDefaultVariant(
  layoutSide: "left" | "right",
  options: Required<
    Pick<
      TradingSplitLayoutOptions,
      "mainSplitSize" | "orderBookSplitSize" | "dataListSplitSize"
    >
  >,
): SplitLayoutModel {
  const mainSplit = options.mainSplitSize;
  const orderBookSplit = options.orderBookSplitSize;
  const dataListSplit = options.dataListSplitSize;

  const mainCol = mainColumnNode(orderBookSplit, dataListSplit);
  const orderEntry = {
    type: "panel" as const,
    panelId: TRADING_PANEL_IDS.ORDER_ENTRY,
  };

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
 */
function createMax2XLVariant(
  layoutSide: "left" | "right",
  options: Required<
    Pick<
      TradingSplitLayoutOptions,
      "mainSplitSize" | "orderBookSplitSize" | "dataListSplitSize"
    >
  >,
): SplitLayoutModel {
  const dataListSplit = options.dataListSplitSize;
  const orderBookSplit = options.orderBookSplitSize;
  const orderEntrySize = options.mainSplitSize;

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
 * @param options - variant, layoutSide, and optional sizes from persistence
 * @returns SplitLayoutModel
 */
export function createTradingSplitLayout(
  options?: TradingSplitLayoutOptions,
): SplitLayoutModel {
  const variant = options?.variant ?? "default";
  const layoutSide = options?.layoutSide ?? "left";
  const opts = {
    mainSplitSize: options?.mainSplitSize ?? DEFAULT_MAIN_SPLIT,
    orderBookSplitSize: options?.orderBookSplitSize ?? DEFAULT_ORDERBOOK_SPLIT,
    dataListSplitSize: options?.dataListSplitSize ?? DEFAULT_DATALIST_SPLIT,
  };
  if (variant === "max2XL") {
    opts.mainSplitSize = options?.mainSplitSize ?? "280px";
    return createMax2XLVariant(layoutSide, opts);
  }
  return createDefaultVariant(layoutSide, opts);
}
