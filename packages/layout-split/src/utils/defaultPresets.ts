import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type {
  SplitLayoutPreset,
  SplitLayoutRule,
  SplitLayoutRuleNode,
} from "../types";

const S = TRADING_PANEL_IDS;

/**
 * default: horizontal [ markets | mainCol | orderEntry* ]; mainCol = vertical [ symbolBar | (tradingView|orderbook) | dataList ].
 * Right column is a sort container with margin/assets/orderEntry panels.
 */
const defaultRightMarketsLeftTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "horizontal",
  children: [
    {
      type: "panel",
      id: S.MARKETS,
      size: "fixed",
      maxSize: "280px",
      disabled: true,
      className: "oui-mr-2",
      collapsible: true,
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
 * default: horizontal [ mainCol | orderEntry* ]; markets in mainCol top.
 */
const defaultRightMarketsTopTree: SplitLayoutRuleNode = {
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
          collapsible: true,
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
 * default: horizontal [ mainCol | orderEntry* ]; markets in mainCol bottom (above data list).
 */
const defaultRightMarketsBottomTree: SplitLayoutRuleNode = {
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
          size: "fixed",
          collapsible: true,
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
 * default: horizontal [ mainCol | orderEntry* ]; markets hidden.
 */
const defaultRightMarketsHideTree: SplitLayoutRuleNode = {
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
 * max2XL: vertical stack [ symbolBar | markets | (tradingView | orderbook) | orderEntry* | dataList ].
 * Order-entry column is a vertical sort container of subpanels.
 */
const max2XLMarketsLeftTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "vertical",
  children: [
    { type: "panel", id: S.SYMBOL_INFO_BAR, size: "auto" },
    { type: "panel", id: S.MARKETS, size: "auto", collapsible: true },
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
 * max2XL: [ symbolBar | markets at top of main | (tradingView | orderbook) | orderEntry* | dataList ].
 */
const max2XLMarketsTopTree: SplitLayoutRuleNode = {
  type: "split",
  orientation: "vertical",
  children: [
    { type: "panel", id: S.SYMBOL_INFO_BAR, size: "auto" },
    { type: "panel", id: S.MARKETS, size: "auto", collapsible: true },
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
 * max2XL: [ symbolBar | (tradingView | orderbook) | markets | orderEntry* | dataList ].
 */
const max2XLMarketsBottomTree: SplitLayoutRuleNode = {
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
    { type: "panel", id: S.MARKETS, size: "auto", collapsible: true },
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
 * max2XL: [ symbolBar | (tradingView | orderbook) | orderEntry* | dataList ]; markets hidden.
 */
const max2XLMarketsHideTree: SplitLayoutRuleNode = {
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

const exchangeStyleRightMarketsLeftRule: SplitLayoutRule = {
  min3XL: defaultRightMarketsLeftTree,
  max4XL: defaultRightMarketsLeftTree,
  default: defaultRightMarketsLeftTree,
  max2XL: max2XLMarketsLeftTree,
};

/**
 * Advanced-right + markets top.
 */
const exchangeStyleRightMarketsTopRule: SplitLayoutRule = {
  min3XL: defaultRightMarketsTopTree,
  max4XL: defaultRightMarketsTopTree,
  default: defaultRightMarketsTopTree,
  max2XL: max2XLMarketsTopTree,
};

/**
 * Advanced-right + markets bottom.
 */
const exchangeStyleRightMarketsBottomRule: SplitLayoutRule = {
  min3XL: defaultRightMarketsBottomTree,
  max4XL: defaultRightMarketsBottomTree,
  default: defaultRightMarketsBottomTree,
  max2XL: max2XLMarketsBottomTree,
};

/**
 * Advanced-right + markets hide.
 */
const exchangeStyleRightMarketsHideRule: SplitLayoutRule = {
  min3XL: defaultRightMarketsHideTree,
  max4XL: defaultRightMarketsHideTree,
  default: defaultRightMarketsHideTree,
  max2XL: max2XLMarketsHideTree,
};

/**
 * Advanced-left variants: mirror advanced-right by swapping markets and order-entry columns.
 */
const defaultLeftMarketsLeftTree: SplitLayoutRuleNode = {
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

const defaultLeftMarketsTopTree: SplitLayoutRuleNode = {
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
          collapsible: true,
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

const defaultLeftMarketsBottomTree: SplitLayoutRuleNode = {
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
          collapsible: true,
        },
        { type: "panel", id: S.DATA_LIST, size: "30%", className: "oui-p-2" },
      ],
    },
  ],
};

const defaultLeftMarketsHideTree: SplitLayoutRuleNode = {
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
  min3XL: defaultLeftMarketsLeftTree,
  max4XL: defaultLeftMarketsLeftTree,
  default: defaultLeftMarketsLeftTree,
  max2XL: max2XLMarketsLeftTree,
};

const exchangeStyleLeftMarketsTopRule: SplitLayoutRule = {
  min3XL: defaultLeftMarketsTopTree,
  max4XL: defaultLeftMarketsTopTree,
  default: defaultLeftMarketsTopTree,
  max2XL: max2XLMarketsTopTree,
};

const exchangeStyleLeftMarketsBottomRule: SplitLayoutRule = {
  min3XL: defaultLeftMarketsBottomTree,
  max4XL: defaultLeftMarketsBottomTree,
  default: defaultLeftMarketsBottomTree,
  max2XL: max2XLMarketsBottomTree,
};

const exchangeStyleLeftMarketsHideRule: SplitLayoutRule = {
  min3XL: defaultLeftMarketsHideTree,
  max4XL: defaultLeftMarketsHideTree,
  default: defaultLeftMarketsHideTree,
  max2XL: max2XLMarketsHideTree,
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
