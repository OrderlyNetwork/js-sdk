import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type {
  SplitLayoutPreset,
  SplitLayoutRule,
  SplitLayoutRuleNode,
} from "../types";

const S = TRADING_PANEL_IDS;

/**
 * lg: horizontal [ markets | mainCol | orderEntry* ]; mainCol = vertical [ symbolBar | (tradingView|orderbook) | dataList ].
 * Right column is a sort container with margin/assets/orderEntry panels.
 */
const lgTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "panel",
      id: S.MARKETS,
      size: "20%",
      maxSize: "280px",
    },
    {
      type: "split",
      orientation: "vertical",
      size: "70%", // mainCol
      children: [
        {
          type: "panel",
          id: S.SYMBOL_INFO_BAR,
          size: "fixed",
          className: "oui-px-3",
          disabled: true,
        },
        {
          type: "split",
          orientation: "horizontal",
          size: "70%",
          children: [
            {
              type: "panel",
              id: S.TRADING_VIEW,
              size: "60%",
              minSize: "540px",
            },
            { type: "panel", id: S.ORDERBOOK, size: "40%" },
          ],
        },
        { type: "panel", id: S.DATA_LIST, size: "30%" },
      ],
    },
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto" },
        { type: "panel", id: S.ASSETS, size: "auto" },
        { type: "panel", id: S.MAIN, size: "auto" },
      ],
    },
  ],
};

/**
 * sm: vertical stack [ symbolBar | markets | (tradingView | orderbook) | orderEntry* | dataList ].
 * Order-entry column is a vertical sort container of subpanels.
 */
const smTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "vertical",
  children: [
    { type: "panel", id: S.SYMBOL_INFO_BAR, size: "auto" },
    { type: "panel", id: S.MARKETS, size: "auto" },
    {
      type: "split",
      orientation: "horizontal",
      children: [
        { type: "panel", id: S.TRADING_VIEW, size: "50%" },
        { type: "panel", id: S.ORDERBOOK, size: "50%" },
      ],
    },
    {
      type: "sort",
      orientation: "vertical",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto" },
        { type: "panel", id: S.ASSETS, size: "auto" },
        { type: "panel", id: S.MAIN, size: "auto" },
      ],
    },
    { type: "panel", id: S.DATA_LIST, size: "30%" },
  ],
};

/**
 * xs / xxs: simple vertical stack of all panels including markets and order-entry subpanels.
 */
const xsTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "vertical",
  children: [
    { type: "panel", id: S.SYMBOL_INFO_BAR, size: "auto" },
    { type: "panel", id: S.MARKETS, size: "auto" },
    { type: "panel", id: S.TRADING_VIEW, size: "auto" },
    { type: "panel", id: S.ORDERBOOK, size: "auto" },
    { type: "panel", id: S.MARGIN, size: "auto" },
    { type: "panel", id: S.ASSETS, size: "auto" },
    { type: "panel", id: S.MAIN, size: "auto" },
    { type: "panel", id: S.DATA_LIST, size: "auto" },
  ],
};

const exchangeStyleRule: SplitLayoutRule = {
  lg: lgTree,
  md: lgTree,
  sm: smTree,
  xs: xsTree,
  xxs: xsTree,
};

/** Built-in split layout preset: exchange-style only. */
export const DEFAULT_SPLIT_PRESETS: SplitLayoutPreset[] = [
  { id: "exchange-style", name: "Exchange Style", rule: exchangeStyleRule },
];

/**
 * Returns the built-in presets array. Exposed for plugin options layouts(builtIn).
 */
export function getDefaultSplitPresets(): SplitLayoutPreset[] {
  return [...DEFAULT_SPLIT_PRESETS];
}
