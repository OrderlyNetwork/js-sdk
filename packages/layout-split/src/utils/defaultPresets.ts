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
const lgRightMarketsLeftTree: SplitLayoutRuleNode = {
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
          className: "oui-px-3 oui-mb-2",
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
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto", className: "oui-p-3" },
        { type: "panel", id: S.ASSETS, size: "auto", className: "oui-p-3" },
        {
          type: "panel",
          id: S.ORDER_ENTRY,
          size: "auto",
          className: "oui-p-3",
        },
      ],
    },
  ],
};

/**
 * lg: horizontal [ mainCol | orderEntry* ]; markets in mainCol top.
 */
const lgRightMarketsTopTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "split",
      orientation: "vertical",
      size: "70%", // mainCol
      children: [
        {
          type: "panel",
          id: S.SYMBOL_INFO_BAR,
          size: "fixed",
          className: "oui-px-3 oui-mb-2",
          disabled: true,
        },
        {
          type: "panel",
          id: S.MARKETS,
          size: "20%",
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
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto", className: "oui-p-3" },
        { type: "panel", id: S.ASSETS, size: "auto", className: "oui-p-3" },
        {
          type: "panel",
          id: S.ORDER_ENTRY,
          size: "auto",
          className: "oui-p-3",
        },
      ],
    },
  ],
};

/**
 * lg: horizontal [ mainCol | orderEntry* ]; markets in mainCol bottom (above data list).
 */
const lgRightMarketsBottomTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "split",
      orientation: "vertical",
      size: "70%", // mainCol
      children: [
        {
          type: "panel",
          id: S.SYMBOL_INFO_BAR,
          size: "fixed",
          className: "oui-px-3 oui-mb-2",
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
        {
          type: "panel",
          id: S.MARKETS,
          size: "20%",
        },
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto", className: "oui-p-3" },
        { type: "panel", id: S.ASSETS, size: "auto", className: "oui-p-3" },
        {
          type: "panel",
          id: S.ORDER_ENTRY,
          size: "auto",
          className: "oui-p-3",
        },
      ],
    },
  ],
};

/**
 * lg: horizontal [ mainCol | orderEntry* ]; markets hidden.
 */
const lgRightMarketsHideTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "split",
      orientation: "vertical",
      size: "70%", // mainCol
      children: [
        {
          type: "panel",
          id: S.SYMBOL_INFO_BAR,
          size: "fixed",
          className: "oui-px-3 oui-mb-2",
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
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto", className: "oui-p-3" },
        { type: "panel", id: S.ASSETS, size: "auto", className: "oui-p-3" },
        {
          type: "panel",
          id: S.ORDER_ENTRY,
          size: "auto",
          className: "oui-p-3",
        },
      ],
    },
  ],
};

/**
 * sm: vertical stack [ symbolBar | markets | (tradingView | orderbook) | orderEntry* | dataList ].
 * Order-entry column is a vertical sort container of subpanels.
 */
const smMarketsLeftTree: SplitLayoutRuleNode = {
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
        { type: "panel", id: S.ORDER_ENTRY, size: "auto" },
      ],
    },
    { type: "panel", id: S.DATA_LIST, size: "30%" },
  ],
};

/**
 * sm: [ symbolBar | markets at top of main | (tradingView | orderbook) | orderEntry* | dataList ].
 */
const smMarketsTopTree: SplitLayoutRuleNode = {
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
        { type: "panel", id: S.ORDER_ENTRY, size: "auto" },
      ],
    },
    { type: "panel", id: S.DATA_LIST, size: "30%" },
  ],
};

/**
 * sm: [ symbolBar | (tradingView | orderbook) | markets | orderEntry* | dataList ].
 */
const smMarketsBottomTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "vertical",
  children: [
    { type: "panel", id: S.SYMBOL_INFO_BAR, size: "auto" },
    {
      type: "split",
      orientation: "horizontal",
      children: [
        { type: "panel", id: S.TRADING_VIEW, size: "50%" },
        { type: "panel", id: S.ORDERBOOK, size: "50%" },
      ],
    },
    { type: "panel", id: S.MARKETS, size: "auto" },
    {
      type: "sort",
      orientation: "vertical",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto" },
        { type: "panel", id: S.ASSETS, size: "auto" },
        { type: "panel", id: S.ORDER_ENTRY, size: "auto" },
      ],
    },
    { type: "panel", id: S.DATA_LIST, size: "30%" },
  ],
};

/**
 * sm: [ symbolBar | (tradingView | orderbook) | orderEntry* | dataList ]; markets hidden.
 */
const smMarketsHideTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "vertical",
  children: [
    { type: "panel", id: S.SYMBOL_INFO_BAR, size: "auto" },
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
        { type: "panel", id: S.ORDER_ENTRY, size: "auto" },
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
    { type: "panel", id: S.ORDER_ENTRY, size: "auto" },
    { type: "panel", id: S.DATA_LIST, size: "auto" },
  ],
};

const exchangeStyleRightMarketsLeftRule: SplitLayoutRule = {
  lg: lgRightMarketsLeftTree,
  md: lgRightMarketsLeftTree,
  sm: smMarketsLeftTree,
  xs: xsTree,
  xxs: xsTree,
};

/**
 * Advanced-right + markets top.
 */
const exchangeStyleRightMarketsTopRule: SplitLayoutRule = {
  lg: lgRightMarketsTopTree,
  md: lgRightMarketsTopTree,
  sm: smMarketsTopTree,
  xs: xsTree,
  xxs: xsTree,
};

/**
 * Advanced-right + markets bottom.
 */
const exchangeStyleRightMarketsBottomRule: SplitLayoutRule = {
  lg: lgRightMarketsBottomTree,
  md: lgRightMarketsBottomTree,
  sm: smMarketsBottomTree,
  xs: xsTree,
  xxs: xsTree,
};

/**
 * Advanced-right + markets hide.
 */
const exchangeStyleRightMarketsHideRule: SplitLayoutRule = {
  lg: lgRightMarketsHideTree,
  md: lgRightMarketsHideTree,
  sm: smMarketsHideTree,
  xs: xsTree,
  xxs: xsTree,
};

/**
 * Advanced-left variants: mirror advanced-right by swapping markets and order-entry columns.
 */
const lgLeftMarketsLeftTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto", className: "oui-p-3" },
        { type: "panel", id: S.ASSETS, size: "auto", className: "oui-p-3" },
        {
          type: "panel",
          id: S.ORDER_ENTRY,
          size: "auto",
          className: "oui-p-3",
        },
      ],
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
          className: "oui-px-3 oui-mb-2",
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
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
  ],
};

const lgLeftMarketsTopTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto", className: "oui-p-3" },
        { type: "panel", id: S.ASSETS, size: "auto", className: "oui-p-3" },
        {
          type: "panel",
          id: S.ORDER_ENTRY,
          size: "auto",
          className: "oui-p-3",
        },
      ],
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
          className: "oui-px-3 oui-mb-2",
          disabled: true,
        },
        {
          type: "panel",
          id: S.MARKETS,
          size: "20%",
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
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
  ],
};

const lgLeftMarketsBottomTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto", className: "oui-p-3" },
        { type: "panel", id: S.ASSETS, size: "auto", className: "oui-p-3" },
        {
          type: "panel",
          id: S.ORDER_ENTRY,
          size: "auto",
          className: "oui-p-3",
        },
      ],
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
          className: "oui-px-3 oui-mb-2",
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
        {
          type: "panel",
          id: S.MARKETS,
          size: "20%",
        },
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
  ],
};

const lgLeftMarketsHideTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "sort",
      orientation: "vertical",
      size: "30%",
      minSize: "280px",
      maxSize: "360px",
      children: [
        { type: "panel", id: S.MARGIN, size: "auto", className: "oui-p-3" },
        { type: "panel", id: S.ASSETS, size: "auto", className: "oui-p-3" },
        {
          type: "panel",
          id: S.ORDER_ENTRY,
          size: "auto",
          className: "oui-p-3",
        },
      ],
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
          className: "oui-px-3 oui-mb-2",
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
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
  ],
};

const exchangeStyleLeftMarketsLeftRule: SplitLayoutRule = {
  lg: lgLeftMarketsLeftTree,
  md: lgLeftMarketsLeftTree,
  sm: smMarketsLeftTree,
  xs: xsTree,
  xxs: xsTree,
};

const exchangeStyleLeftMarketsTopRule: SplitLayoutRule = {
  lg: lgLeftMarketsTopTree,
  md: lgLeftMarketsTopTree,
  sm: smMarketsTopTree,
  xs: xsTree,
  xxs: xsTree,
};

const exchangeStyleLeftMarketsBottomRule: SplitLayoutRule = {
  lg: lgLeftMarketsBottomTree,
  md: lgLeftMarketsBottomTree,
  sm: smMarketsBottomTree,
  xs: xsTree,
  xxs: xsTree,
};

const exchangeStyleLeftMarketsHideRule: SplitLayoutRule = {
  lg: lgLeftMarketsHideTree,
  md: lgLeftMarketsHideTree,
  sm: smMarketsHideTree,
  xs: xsTree,
  xxs: xsTree,
};

/** Built-in split layout presets: advanced-left/right × markets left/top/bottom/hide. */
export const DEFAULT_SPLIT_PRESETS: SplitLayoutPreset[] = [
  {
    id: "advanced-right_markets-left",
    name: "Advanced Right · Markets Left",
    rule: exchangeStyleRightMarketsLeftRule,
  },
  {
    id: "advanced-right_markets-top",
    name: "Advanced Right · Markets Top",
    rule: exchangeStyleRightMarketsTopRule,
  },
  {
    id: "advanced-right_markets-bottom",
    name: "Advanced Right · Markets Bottom",
    rule: exchangeStyleRightMarketsBottomRule,
  },
  {
    id: "advanced-right_markets-hide",
    name: "Advanced Right · Markets Hide",
    rule: exchangeStyleRightMarketsHideRule,
  },
  {
    id: "advanced-left_markets-left",
    name: "Advanced Left · Markets Left",
    rule: exchangeStyleLeftMarketsLeftRule,
  },
  {
    id: "advanced-left_markets-top",
    name: "Advanced Left · Markets Top",
    rule: exchangeStyleLeftMarketsTopRule,
  },
  {
    id: "advanced-left_markets-bottom",
    name: "Advanced Left · Markets Bottom",
    rule: exchangeStyleLeftMarketsBottomRule,
  },
  {
    id: "advanced-left_markets-hide",
    name: "Advanced Left · Markets Hide",
    rule: exchangeStyleLeftMarketsHideRule,
  },
];

/**
 * Returns the built-in presets array. Exposed for plugin options layouts(builtIn).
 */
export function getDefaultSplitPresets(): SplitLayoutPreset[] {
  return [...DEFAULT_SPLIT_PRESETS];
}
