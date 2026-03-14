import type React from "react";
import { TRADING_PANEL_IDS } from "@orderly.network/layout-core";
import type {
  SplitLayoutPreset,
  SplitLayoutRule,
  SplitLayoutRuleNode,
} from "../types";

const S = TRADING_PANEL_IDS;

// ─────────────────────────────────────────────────────────────────────────────
// Compressed format: short field names to reduce file size when many rules exist.
// Mapping: t=type, o=orientation, c=children, s=size, mn=minSize, mx=maxSize,
// d=disabled, cl=collapsible, dc=defaultCollapsed, tl=title, cn=className, st=style, i=id
// ─────────────────────────────────────────────────────────────────────────────

/** Compressed node format for smaller preset definitions. */
type CNode =
  | {
      t: "panel";
      i: string;
      s?: string;
      mn?: string;
      mx?: string;
      d?: boolean;
      cl?: boolean;
      dc?: boolean;
      tl?: string;
      cn?: string;
      st?: React.CSSProperties;
    }
  | {
      t: "split";
      o: "horizontal" | "vertical";
      c: CNode[];
      s?: string;
      mn?: string;
      mx?: string;
    }
  | {
      t: "sort";
      o: "horizontal" | "vertical";
      c: CNode[];
      s?: string;
      mn?: string;
      mx?: string;
    };

/** Compressed rule: lg/md/sm/xs keys unchanged. */
type CRule = { lg?: CNode; md?: CNode; sm?: CNode; xs?: CNode };

/** Shared sort-node children: Margin | Assets | OrderEntry. Used by all order-entry sort containers. */
// const ORDER_ENTRY_SORT_CHILDREN: CNode[] = [
//   { t: "panel", i: S.MARGIN, s: "auto" },
//   { t: "panel", i: S.ASSETS, s: "auto" },
//   { t: "panel", i: S.ORDER_ENTRY, s: "auto" },
// ];

/** Same as above but with className for padding. */
const ORDER_ENTRY_SORT_CHILDREN_CN: CNode[] = [
  { t: "panel", i: S.MARGIN, s: "auto", cn: "oui-p-3" },
  { t: "panel", i: S.ASSETS, s: "auto", cn: "oui-p-3" },
  { t: "panel", i: S.ORDER_ENTRY, s: "auto", cn: "oui-p-3" },
];

/** Builds order-entry sort node (vertical, Margin|Assets|OrderEntry). */
function orderEntrySort(opts: {
  s: string;
  mn?: string;
  mx?: string;
  cn?: boolean;
}): CNode {
  return {
    t: "sort",
    o: "vertical",
    s: opts.s,
    mn: opts.mn,
    mx: opts.mx,
    c: ORDER_ENTRY_SORT_CHILDREN_CN,
  };
}

/** Maps optional child props (s, mn, mx) to full SplitLayoutChildConstraints. */
function mapChildProps(n: { s?: string; mn?: string; mx?: string }): Partial<{
  size: string;
  minSize: string;
  maxSize: string;
}> {
  const out: Record<string, string> = {};
  if (n.s !== undefined) out.size = n.s;
  if (n.mn !== undefined) out.minSize = n.mn;
  if (n.mx !== undefined) out.maxSize = n.mx;
  return out as Partial<{ size: string; minSize: string; maxSize: string }>;
}

/** Maps optional panel props to full panel node shape. */
function mapPanelProps(n: CNode & { t: "panel" }): Partial<{
  size: string;
  minSize: string;
  maxSize: string;
  disabled: boolean;
  collapsible: boolean;
  defaultCollapsed: boolean;
  title: string;
  className: string;
  style: React.CSSProperties;
}> {
  const out: Record<string, unknown> = {};
  if (n.s !== undefined) out.size = n.s;
  if (n.mn !== undefined) out.minSize = n.mn;
  if (n.mx !== undefined) out.maxSize = n.mx;
  if (n.d !== undefined) out.disabled = n.d;
  if (n.cl !== undefined) out.collapsible = n.cl;
  if (n.dc !== undefined) out.defaultCollapsed = n.dc;
  if (n.tl !== undefined) out.title = n.tl;
  if (n.cn !== undefined) out.className = n.cn;
  if (n.st !== undefined) out.style = n.st;
  return out as Partial<{
    size: string;
    minSize: string;
    maxSize: string;
    disabled: boolean;
    collapsible: boolean;
    defaultCollapsed: boolean;
    title: string;
    className: string;
    style: React.CSSProperties;
  }>;
}

/** Recursively expands a compressed node to SplitLayoutRuleNode. */
function expandNode(n: CNode): SplitLayoutRuleNode {
  if (n.t === "panel") {
    return {
      type: "panel",
      id: n.i,
      ...mapPanelProps(n),
    } as SplitLayoutRuleNode;
  }
  if (n.t === "split") {
    return {
      type: "split",
      orientation: n.o,
      children: n.c.map(expandNode),
      ...mapChildProps(n),
    } as SplitLayoutRuleNode;
  }
  return {
    type: "sort",
    orientation: n.o,
    children: n.c.map(expandNode),
    ...mapChildProps(n),
  } as SplitLayoutRuleNode;
}

/** Expands a compressed rule to SplitLayoutRule. */
function expandRule(r: CRule): SplitLayoutRule {
  return {
    lg: r.lg !== undefined ? expandNode(r.lg) : undefined,
    md: r.md !== undefined ? expandNode(r.md) : undefined,
    sm: r.sm !== undefined ? expandNode(r.sm) : undefined,
    xs: r.xs !== undefined ? expandNode(r.xs) : undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared small-screen layout trees (sm breakpoint) – used by both right and left
// ─────────────────────────────────────────────────────────────────────────────

/** sm: [ symbolBar | markets | (tradingView | orderbook) | orderEntry* | dataList ]. */
const smMarketsLeftTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          d: true,
          cn: "oui-px-3 oui-mb-2",
        },
        {
          t: "split",
          o: "horizontal",
          s: "50%",
          c: [
            {
              t: "panel",
              i: S.MARKETS,
              s: "fixed",
              mn: "70px",
              mx: "300px",
              d: true,
              cn: "oui-mr-2",
              cl: true,
            },
            { t: "panel", i: S.TRADING_VIEW, s: "50%" },
            { t: "panel", i: S.ORDERBOOK, s: "50%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "50%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort({ s: "auto", cn: true }),
  ],
};

/** sm: [ symbolBar | markets at top | (tradingView | orderbook) | orderEntry* | dataList ]. */
const smMarketsTopTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    { t: "panel", i: S.SYMBOL_INFO_BAR, s: "auto" },
    { t: "panel", i: S.MARKETS, s: "auto", cl: true },
    {
      t: "split",
      o: "horizontal",
      s: "40%",
      c: [
        { t: "panel", i: S.TRADING_VIEW, s: "50%" },
        { t: "panel", i: S.ORDERBOOK, s: "50%" },
      ],
    },
    orderEntrySort({ s: "auto" }),
    { t: "panel", i: S.DATA_LIST, s: "30%" },
  ],
};

/** sm: [ symbolBar | (tradingView | orderbook) | markets | orderEntry* | dataList ]. */
const smMarketsBottomTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    { t: "panel", i: S.SYMBOL_INFO_BAR, s: "auto" },
    {
      t: "split",
      o: "horizontal",
      s: "40%",
      c: [
        { t: "panel", i: S.TRADING_VIEW, s: "50%" },
        { t: "panel", i: S.ORDERBOOK, s: "50%" },
      ],
    },
    { t: "panel", i: S.MARKETS, s: "auto", cl: true },
    orderEntrySort({ s: "auto" }),
    { t: "panel", i: S.DATA_LIST, s: "30%" },
  ],
};

/** sm: [ symbolBar | (tradingView | orderbook) | orderEntry* | dataList ]; markets hidden. */
const smMarketsHideTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    { t: "panel", i: S.SYMBOL_INFO_BAR, s: "auto" },
    {
      t: "split",
      o: "horizontal",
      s: "40%",
      c: [
        { t: "panel", i: S.TRADING_VIEW, s: "50%" },
        { t: "panel", i: S.ORDERBOOK, s: "50%" },
      ],
    },
    orderEntrySort({ s: "auto" }),
    { t: "panel", i: S.DATA_LIST, s: "30%" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// xs layout trees (≤480px) – mobile-optimized, full vertical stack
// ─────────────────────────────────────────────────────────────────────────────

/** xs: vertical [ symbolBar | markets | tradingView | orderbook | orderEntry* | dataList ]; markets collapsible at top. */
const xsMarketsLeftTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    {
      t: "split",
      o: "horizontal",
      c: [
        {
          t: "split",
          o: "vertical",
          s: "75%",
          c: [
            {
              t: "panel",
              i: S.SYMBOL_INFO_BAR,
              s: "fixed",
              cn: "oui-px-2 oui-mb-2",
              d: true,
            },
            {
              t: "split",
              o: "horizontal",
              c: [
                {
                  t: "panel",
                  i: S.MARKETS,
                  s: "auto",
                  cl: true,
                  dc: true,
                  cn: "oui-p-2",
                },
                {
                  t: "split",
                  o: "vertical",
                  c: [
                    { t: "panel", i: S.TRADING_VIEW, s: "40%", mn: "200px" },
                    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
                  ],
                },
              ],
            },
          ],
        },

        orderEntrySort({ s: "25%", mn: "200px", mx: "300px" }),
      ],
    },

    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
  ],
};

/** xs: vertical [ symbolBar | markets | tradingView | orderbook | orderEntry* | dataList ]; markets at top. */
const xsMarketsTopTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    { t: "panel", i: S.SYMBOL_INFO_BAR, s: "auto", cn: "oui-px-2 oui-mb-1" },
    { t: "panel", i: S.MARKETS, s: "auto", cl: true, cn: "oui-p-2" },
    { t: "panel", i: S.TRADING_VIEW, s: "40%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    orderEntrySort({ s: "auto", cn: true }),
    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
  ],
};

/** xs: vertical [ symbolBar | tradingView | orderbook | markets | orderEntry* | dataList ]; markets at bottom. */
const xsMarketsBottomTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    { t: "panel", i: S.SYMBOL_INFO_BAR, s: "auto", cn: "oui-px-2 oui-mb-1" },
    { t: "panel", i: S.TRADING_VIEW, s: "40%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    { t: "panel", i: S.MARKETS, s: "auto", cl: true, cn: "oui-p-2" },
    orderEntrySort({ s: "auto", cn: true }),
    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
  ],
};

/** xs: vertical [ symbolBar | tradingView | orderbook | orderEntry* | dataList ]; markets hidden. */
const xsMarketsHideTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    { t: "panel", i: S.SYMBOL_INFO_BAR, s: "auto", cn: "oui-px-2 oui-mb-1" },
    { t: "panel", i: S.TRADING_VIEW, s: "45%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    orderEntrySort({ s: "auto", cn: true }),
    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Advanced-right layout trees (lg breakpoint) – 1680px+, larger panels
// ─────────────────────────────────────────────────────────────────────────────

/** lg: horizontal [ mainCol 75% | orderEntry* 25% ]; orderEntry on right; mainCol = vertical [ symbolBar | (markets|tradingView|orderbook) | dataList ]. */
const lgRightMarketsLeftTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "panel",
      i: S.MARKETS,
      s: "fixed",
      mn: "70px",
      mx: "300px",
      d: true,
      cn: "oui-mr-2",
      cl: true,
    },
    {
      t: "split",
      o: "vertical",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "600px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort({ s: "25%", mn: "300px", mx: "400px", cn: true }),
  ],
};

/** lg: horizontal [ mainCol 75% | orderEntry* 25% ]; markets in mainCol top. */
const lgRightMarketsTopTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        { t: "panel", i: S.MARKETS, s: "20%", cl: true },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "600px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort({ s: "25%", mn: "300px", mx: "400px", cn: true }),
  ],
};

/** lg: horizontal [ mainCol 75% | orderEntry* 25% ]; markets in mainCol bottom. */
const lgRightMarketsBottomTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "600px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.MARKETS, s: "fixed", cl: true },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort({ s: "25%", mn: "300px", mx: "400px", cn: true }),
  ],
};

/** lg: horizontal [ mainCol 75% | orderEntry* 25% ]; markets hidden. */
const lgRightMarketsHideTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "600px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort({ s: "25%", mn: "300px", mx: "400px", cn: true }),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Advanced-right layout trees (md breakpoint) – 1440px–1679px
// ─────────────────────────────────────────────────────────────────────────────

/** md: horizontal [ mainCol | orderEntry* ]; orderEntry on right. mainCol = vertical [ symbolBar | (markets|tradingView|orderbook) | dataList ]. */
const mdRightMarketsLeftTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "split",
      o: "vertical",
      s: "70%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          mn: "320px",
          c: [
            {
              t: "panel",
              i: S.MARKETS,
              s: "fixed",
              mn: "70px",
              mx: "280px",
              d: true,
              cn: "oui-mr-2",
              cl: true,
            },
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "540px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%", mn: "280px" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort({ s: "30%", mn: "280px", mx: "360px", cn: true }),
  ],
};

/** md: horizontal [ mainCol | orderEntry* ]; orderEntry on right; markets in mainCol top. */
const mdRightMarketsTopTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    {
      t: "panel",
      i: S.HORIZONTAL_MARKETS,
      s: "fixed",
      cn: "oui-mb-2",
      d: true,
    },
    {
      t: "split",
      o: "horizontal",
      c: [
        {
          t: "split",
          o: "vertical",
          s: "70%",
          c: [
            {
              t: "panel",
              i: S.SYMBOL_INFO_BAR,
              s: "fixed",
              cn: "oui-px-3 oui-mb-2",
              d: true,
            },

            {
              t: "split",
              o: "horizontal",
              s: "70%",
              c: [
                { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "540px" },
                { t: "panel", i: S.ORDERBOOK, s: "40%" },
              ],
            },
            { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
          ],
        },
        orderEntrySort({ s: "30%", mn: "280px", mx: "360px", cn: true }),
      ],
    },
  ],
};

/** md: horizontal [ mainCol | orderEntry* ]; orderEntry on right; markets in mainCol bottom. */
const mdRightMarketsBottomTree: CNode = {
  t: "split",
  o: "vertical",

  c: [
    {
      t: "split",
      o: "horizontal",
      c: [
        {
          t: "split",
          o: "vertical",
          s: "70%",
          c: [
            {
              t: "panel",
              i: S.SYMBOL_INFO_BAR,
              s: "fixed",
              cn: "oui-px-3 oui-mb-2",
              d: true,
            },
            {
              t: "split",
              o: "horizontal",
              s: "70%",
              c: [
                { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "540px" },
                { t: "panel", i: S.ORDERBOOK, s: "40%" },
              ],
            },

            { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
          ],
        },
        orderEntrySort({ s: "30%", mn: "280px", mx: "360px", cn: true }),
      ],
    },
    {
      t: "panel",
      i: S.HORIZONTAL_MARKETS,
      s: "fixed",
      cn: "oui-fixed oui-bottom-0 oui-left-0 oui-right-0",
      d: true,
    },
  ],
};

/** md: horizontal [ mainCol | orderEntry* ]; orderEntry on right; markets hidden. */
const mdRightMarketsHideTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "split",
      o: "vertical",
      s: "70%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "540px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort({ s: "30%", mn: "280px", mx: "360px", cn: true }),
  ],
};

/** Advanced-right rules: lg + md + sm + xs. */
const exchangeStyleRightMarketsLeftRule: CRule = {
  lg: lgRightMarketsLeftTree,
  md: mdRightMarketsLeftTree,
  sm: smMarketsLeftTree,
  xs: xsMarketsLeftTree,
};

const exchangeStyleRightMarketsTopRule: CRule = {
  lg: lgRightMarketsTopTree,
  md: mdRightMarketsTopTree,
  sm: smMarketsTopTree,
  xs: xsMarketsTopTree,
};

const exchangeStyleRightMarketsBottomRule: CRule = {
  lg: lgRightMarketsBottomTree,
  md: mdRightMarketsBottomTree,
  sm: smMarketsBottomTree,
  xs: xsMarketsBottomTree,
};

const exchangeStyleRightMarketsHideRule: CRule = {
  lg: lgRightMarketsHideTree,
  md: mdRightMarketsHideTree,
  sm: smMarketsHideTree,
  xs: xsMarketsHideTree,
};

// ─────────────────────────────────────────────────────────────────────────────
// Advanced-left layout trees (lg breakpoint) – 1680px+
// ─────────────────────────────────────────────────────────────────────────────

/** lg: orderEntry* left 25% | mainCol right 75%; markets left (no dedicated panel). */
const lgLeftMarketsLeftTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort({ s: "25%", mn: "300px", mx: "400px", cn: true }),
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "600px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
    {
      t: "panel",
      i: S.MARKETS,
      s: "fixed",
      mn: "70px",
      mx: "300px",
      d: true,
      cl: true,
    },
  ],
};

/** lg: orderEntry* left | mainCol right; markets top in mainCol. */
const lgLeftMarketsTopTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort({ s: "25%", mn: "300px", mx: "400px", cn: true }),
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        { t: "panel", i: S.MARKETS, s: "20%", cl: true },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "600px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
  ],
};

/** lg: orderEntry* left | mainCol right; markets bottom in mainCol. */
const lgLeftMarketsBottomTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort({ s: "25%", mn: "300px", mx: "400px", cn: true }),
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "600px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.MARKETS, s: "20%", cl: true },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
  ],
};

/** lg: orderEntry* left | mainCol right; markets hidden. */
const lgLeftMarketsHideTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort({ s: "25%", mn: "300px", mx: "400px", cn: true }),
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "600px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Advanced-left layout trees (md breakpoint) – 1440px–1679px
// ─────────────────────────────────────────────────────────────────────────────

/** md: orderEntry* left | mainCol right; markets left (no dedicated panel). */
const mdLeftMarketsLeftTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort({ s: "30%", mn: "280px", mx: "360px", cn: true }),
    {
      t: "split",
      o: "vertical",
      s: "70%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "60%",
          mx: "540px",
          mn: "480px",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "540px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "40%", cn: "oui-p-2" },
      ],
    },
  ],
};

/** md: orderEntry* left | mainCol right; markets top in mainCol. */
const mdLeftMarketsTopTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort({ s: "30%", mn: "280px", mx: "360px", cn: true }),
    {
      t: "split",
      o: "vertical",
      s: "70%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        { t: "panel", i: S.MARKETS, s: "20%", cl: true },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "540px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
  ],
};

/** md: orderEntry* left | mainCol right; markets bottom in mainCol. */
const mdLeftMarketsBottomTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort({ s: "30%", mn: "280px", mx: "360px", cn: true }),
    {
      t: "split",
      o: "vertical",
      s: "70%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "540px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.MARKETS, s: "20%", cl: true },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
  ],
};

/** md: orderEntry* left | mainCol right; markets hidden. */
const mdLeftMarketsHideTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort({ s: "30%", mn: "280px", mx: "360px", cn: true }),
    {
      t: "split",
      o: "vertical",
      s: "70%",
      c: [
        {
          t: "panel",
          i: S.SYMBOL_INFO_BAR,
          s: "fixed",
          cn: "oui-px-3 oui-mb-2",
          d: true,
        },
        {
          t: "split",
          o: "horizontal",
          s: "70%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "60%", mn: "540px" },
            { t: "panel", i: S.ORDERBOOK, s: "40%" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
  ],
};

/** Advanced-left rules: lg + md + sm + xs. */
const exchangeStyleLeftMarketsLeftRule: CRule = {
  lg: lgLeftMarketsLeftTree,
  md: mdLeftMarketsLeftTree,
  sm: smMarketsLeftTree,
  xs: xsMarketsLeftTree,
};

const exchangeStyleLeftMarketsTopRule: CRule = {
  lg: lgLeftMarketsTopTree,
  md: mdLeftMarketsTopTree,
  sm: smMarketsTopTree,
  xs: xsMarketsTopTree,
};

const exchangeStyleLeftMarketsBottomRule: CRule = {
  lg: lgLeftMarketsBottomTree,
  md: mdLeftMarketsBottomTree,
  sm: smMarketsBottomTree,
  xs: xsMarketsBottomTree,
};

const exchangeStyleLeftMarketsHideRule: CRule = {
  lg: lgLeftMarketsHideTree,
  md: mdLeftMarketsHideTree,
  sm: smMarketsHideTree,
  xs: xsMarketsHideTree,
};

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

/** Built-in split layout presets: advanced-left/right × markets left/top/bottom/hide. */
export const DEFAULT_SPLIT_PRESETS: SplitLayoutPreset[] = [
  {
    id: "advanced-right_markets-left",
    name: "Advanced Right · Markets Left",
    rule: expandRule(exchangeStyleRightMarketsLeftRule),
  },
  {
    id: "advanced-right_markets-top",
    name: "Advanced Right · Markets Top",
    rule: expandRule(exchangeStyleRightMarketsTopRule),
  },
  {
    id: "advanced-right_markets-bottom",
    name: "Advanced Right · Markets Bottom",
    rule: expandRule(exchangeStyleRightMarketsBottomRule),
  },
  {
    id: "advanced-right_markets-hide",
    name: "Advanced Right · Markets Hide",
    rule: expandRule(exchangeStyleRightMarketsHideRule),
  },
  {
    id: "advanced-left_markets-left",
    name: "Advanced Left · Markets Left",
    rule: expandRule(exchangeStyleLeftMarketsLeftRule),
  },
  {
    id: "advanced-left_markets-top",
    name: "Advanced Left · Markets Top",
    rule: expandRule(exchangeStyleLeftMarketsTopRule),
  },
  {
    id: "advanced-left_markets-bottom",
    name: "Advanced Left · Markets Bottom",
    rule: expandRule(exchangeStyleLeftMarketsBottomRule),
  },
  {
    id: "advanced-left_markets-hide",
    name: "Advanced Left · Markets Hide",
    rule: expandRule(exchangeStyleLeftMarketsHideRule),
  },
];

/**
 * Returns the built-in presets array. Exposed for plugin options layouts(builtIn).
 */
export function getDefaultSplitPresets(): SplitLayoutPreset[] {
  return [...DEFAULT_SPLIT_PRESETS];
}
