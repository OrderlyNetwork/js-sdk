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
      cn?: string;
      st?: React.CSSProperties;
    }
  | {
      t: "sort";
      o: "horizontal" | "vertical";
      c: CNode[];
      s?: string;
      mn?: string;
      mx?: string;
      cn?: string;
      st?: React.CSSProperties;
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

/**
 * HORIZONTAL_MARKETS panel fixed at page bottom (above scaffold footer).
 * Used in markets-bottom preset for all breakpoints.
 */
const HORIZONTAL_MARKETS_BOTTOM_PANEL: CNode = {
  t: "panel",
  i: S.HORIZONTAL_MARKETS,
  s: "fixed",
  cn: "oui-mt-2",
  d: true,
};

/**
 * HORIZONTAL_MARKETS panel fixed at vertical top. Used in markets-top preset.
 */
const HORIZONTAL_MARKETS_TOP_PANEL: CNode = {
  t: "panel",
  i: S.HORIZONTAL_MARKETS,
  s: "fixed",
  cn: "oui-mb-2",
  d: true,
};

/** sm: Symbol bar in vertical layout (auto height, padding). */
const SYMBOL_BAR_FIXED: CNode = {
  t: "panel",
  i: S.SYMBOL_INFO_BAR,
  s: "fixed",
  d: true,
  cn: "oui-px-3 oui-mb-2",
};

/**
 * sm: Horizontal split [TradingView | Orderbook]. Reused in sm vertical layouts.
 */
function smTradingOrderbookSplit(opts?: {
  splitSize?: string;
  obMn?: string;
  obMx?: string;
}): CNode {
  return {
    t: "split",
    o: "horizontal",
    s: opts?.splitSize ?? "40%",
    c: [
      { t: "panel", i: S.TRADING_VIEW, s: "50%" },
      {
        t: "panel",
        i: S.ORDERBOOK,
        s: "50%",
        mn: opts?.obMn ?? "240px",
        mx: opts?.obMx ?? "300px",
      },
    ],
  };
}

/**
 * Data list panel with default padding. Size and optional minSize configurable.
 */
function dataList(s: string, opts?: { mn?: string; cn?: string }): CNode {
  return {
    t: "panel",
    i: S.DATA_LIST,
    s,
    mn: opts?.mn,
    cn: opts?.cn ?? "oui-p-2",
  };
}

/** Builds order-entry sort node (vertical, Margin|Assets|OrderEntry). */
function orderEntrySort(opts?: {
  s?: string;
  mn?: string;
  mx?: string;
  cn?: string;
}): CNode {
  // { s: "280px", mn: "280px", mx: "360px" }
  return {
    t: "sort",
    o: "vertical",
    s: opts?.s ?? "280px",
    mn: opts?.mn ?? "280px",
    mx: opts?.mx ?? "360px",
    cn: opts?.cn,
    c: ORDER_ENTRY_SORT_CHILDREN_CN,
  };
}

/** Maps optional child props (s, mn, mx, cn, st) for split/sort nodes. */
function mapChildProps(n: {
  s?: string;
  mn?: string;
  mx?: string;
  cn?: string;
  st?: React.CSSProperties;
}): Partial<{
  size: string;
  minSize: string;
  maxSize: string;
  className: string;
  style: React.CSSProperties;
}> {
  const out: Record<string, string | React.CSSProperties> = {};
  if (n.s !== undefined) out.size = n.s;
  if (n.mn !== undefined) out.minSize = n.mn;
  if (n.mx !== undefined) out.maxSize = n.mx;
  if (n.cn !== undefined) out.className = n.cn;
  if (n.st !== undefined) out.style = n.st;
  return out as Partial<{
    size: string;
    minSize: string;
    maxSize: string;
    className: string;
    style: React.CSSProperties;
  }>;
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
// sm layout trees (768px–1199px) – separate Right (orderEntry right) and Left (orderEntry left)
// ─────────────────────────────────────────────────────────────────────────────

/** sm Left: [ orderEntry* | mainCol ]; orderEntry on left. */
const smLeftMarketsLeftTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort(),
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
            { t: "panel", i: S.TRADING_VIEW, s: "70%" },
            { t: "panel", i: S.ORDERBOOK, s: "30%", mn: "240px", mx: "300px" },
            {
              t: "panel",
              i: S.MARKETS,
              s: "fixed",
              mn: "70px",
              mx: "280px",
              d: true,
              cn: "oui-ml-2",
              cl: true,
              dc: true,
            },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "50%", cn: "oui-p-2" },
      ],
    },
  ],
};

/** sm Right: [ mainCol | orderEntry* ]; orderEntry on right. */
const smRightMarketsLeftTree: CNode = {
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
              mx: "280px",
              d: true,
              cn: "oui-mr-2",
              cl: true,
              dc: true,
            },
            { t: "panel", i: S.TRADING_VIEW, s: "70%" },
            { t: "panel", i: S.ORDERBOOK, s: "30%", mn: "240px", mx: "300px" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "50%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort(),
  ],
};

/** sm Left: vertical; orderEntry before tradingView. */
const smLeftMarketsTopTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    SYMBOL_BAR_FIXED,
    { t: "panel", i: S.MARKETS, s: "auto", cl: true },
    orderEntrySort(),
    smTradingOrderbookSplit(),
    dataList("30%"),
  ],
};

/** sm Right: vertical; orderEntry after tradingView. */
const smRightMarketsTopTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "split",
      o: "vertical",
      c: [
        HORIZONTAL_MARKETS_TOP_PANEL,
        {
          t: "split",
          o: "vertical",
          c: [SYMBOL_BAR_FIXED, smTradingOrderbookSplit(), dataList("30%")],
        },
      ],
    },
    orderEntrySort(),
  ],
};

/** sm Left: horizontal [ orderEntry* | mainCol ]; HORIZONTAL_MARKETS at bottom. */
const smLeftMarketsBottomTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    {
      t: "split",
      o: "horizontal",
      c: [
        orderEntrySort(),
        {
          t: "split",
          o: "vertical",
          c: [SYMBOL_BAR_FIXED, smTradingOrderbookSplit(), dataList("30%")],
        },
      ],
    },
    HORIZONTAL_MARKETS_BOTTOM_PANEL,
  ],
};

/** sm Right: horizontal [ mainCol | orderEntry* ]; HORIZONTAL_MARKETS at bottom. */
const smRightMarketsBottomTree: CNode = {
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
          c: [SYMBOL_BAR_FIXED, smTradingOrderbookSplit(), dataList("30%")],
        },
        orderEntrySort(),
      ],
    },
    HORIZONTAL_MARKETS_BOTTOM_PANEL,
  ],
};

/** sm Left: vertical; orderEntry before tradingView. */
const smLeftMarketsHideTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort(),
    {
      t: "split",
      o: "vertical",
      s: "85%",
      c: [SYMBOL_BAR_FIXED, smTradingOrderbookSplit(), dataList("30%")],
    },
  ],
};

/** sm Right: vertical; orderEntry after tradingView. */
const smRightMarketsHideTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    {
      t: "split",
      o: "vertical",
      s: "75%",
      c: [SYMBOL_BAR_FIXED, smTradingOrderbookSplit(), dataList("30%")],
    },
    orderEntrySort(),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// xs layout trees (≤480px) – separate Right (orderEntry right) and Left (orderEntry left)
// ─────────────────────────────────────────────────────────────────────────────

const xsMarketsLeftMainCol: CNode = {
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
          t: "split",
          o: "vertical",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "40%", mn: "200px" },
            { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
          ],
        },
        {
          t: "panel",
          i: S.MARKETS,
          s: "fixed",
          mn: "70px",
          mx: "280px",
          d: true,
          cl: true,
          dc: true,
          cn: "oui-ml-2",
        },
      ],
    },
  ],
};

/** xs Left: horizontal [ orderEntry* | mainCol ]; orderEntry on left. */
const xsLeftMarketsLeftTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    {
      t: "split",
      o: "horizontal",
      s: "60%",
      c: [orderEntrySort(), xsMarketsLeftMainCol],
    },
    dataList("40%", { mn: "100px" }),
  ],
};

/** xs Right: horizontal [ mainCol | orderEntry* ]; orderEntry on right. */
const xsRightMarketsLeftTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    {
      t: "split",
      o: "horizontal",
      s: "60%",
      c: [xsMarketsLeftMainCol, orderEntrySort()],
    },
    dataList("40%", { mn: "100px" }),
  ],
};

/** xs Left: vertical; orderEntry before tradingView. */
const xsLeftMarketsTopTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    SYMBOL_BAR_FIXED,
    { t: "panel", i: S.MARKETS, s: "auto", cl: true, cn: "oui-p-2" },
    orderEntrySort(),
    { t: "panel", i: S.TRADING_VIEW, s: "40%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
  ],
};

/** xs Right: vertical; orderEntry after tradingView. */
const xsRightMarketsTopTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    HORIZONTAL_MARKETS_TOP_PANEL,
    SYMBOL_BAR_FIXED,
    { t: "panel", i: S.MARKETS, s: "auto", cl: true, cn: "oui-p-2" },
    { t: "panel", i: S.TRADING_VIEW, s: "40%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    orderEntrySort(),
    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
  ],
};

/** xs Left: vertical; orderEntry before tradingView; HORIZONTAL_MARKETS at bottom. */
const xsLeftMarketsBottomTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    SYMBOL_BAR_FIXED,
    orderEntrySort(),
    { t: "panel", i: S.TRADING_VIEW, s: "40%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    { t: "panel", i: S.MARKETS, s: "auto", cl: true, cn: "oui-p-2" },
    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
    HORIZONTAL_MARKETS_BOTTOM_PANEL,
  ],
};

/** xs Right: vertical; orderEntry after tradingView; HORIZONTAL_MARKETS at bottom. */
const xsRightMarketsBottomTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    SYMBOL_BAR_FIXED,
    { t: "panel", i: S.TRADING_VIEW, s: "40%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    { t: "panel", i: S.MARKETS, s: "auto", cl: true, cn: "oui-p-2" },
    orderEntrySort(),
    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
    HORIZONTAL_MARKETS_BOTTOM_PANEL,
  ],
};

/** xs Left: vertical; orderEntry before tradingView. */
const xsLeftMarketsHideTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    SYMBOL_BAR_FIXED,
    orderEntrySort(),
    { t: "panel", i: S.TRADING_VIEW, s: "45%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    { t: "panel", i: S.DATA_LIST, s: "25%", mn: "100px", cn: "oui-p-2" },
  ],
};

/** xs Right: vertical; orderEntry after tradingView. */
const xsRightMarketsHideTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    SYMBOL_BAR_FIXED,
    { t: "panel", i: S.TRADING_VIEW, s: "45%", mn: "200px" },
    { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "120px" },
    orderEntrySort(),
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
    orderEntrySort(),
  ],
};

/** lg: horizontal [ mainCol 75% | orderEntry* 25% ]; markets in mainCol top. */
const lgRightMarketsTopTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    HORIZONTAL_MARKETS_TOP_PANEL,
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
                    { t: "panel", i: S.TRADING_VIEW, s: "65%", mn: "600px" },
                    {
                      t: "panel",
                      i: S.ORDERBOOK,
                      s: "35%",
                      mn: "280px",
                    },
                  ],
                },
                { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
              ],
            },
          ],
        },
        orderEntrySort(),
      ],
    },
  ],
};

/** lg: horizontal [ mainCol 75% | orderEntry* 25% ]; HORIZONTAL_MARKETS fixed at bottom. */
const lgRightMarketsBottomTree: CNode = {
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
        orderEntrySort(),
      ],
    },
    HORIZONTAL_MARKETS_BOTTOM_PANEL,
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
    orderEntrySort(),
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
          s: "50%",
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
        { t: "panel", i: S.DATA_LIST, s: "50%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort(),
  ],
};

/** md: horizontal [ mainCol | orderEntry* ]; orderEntry on right; markets in mainCol top. */
const mdRightMarketsTopTree: CNode = {
  t: "split",
  o: "vertical",
  c: [
    HORIZONTAL_MARKETS_TOP_PANEL,
    {
      t: "split",
      o: "horizontal",
      c: [
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
              s: "50%",
              c: [
                { t: "panel", i: S.TRADING_VIEW, s: "70%", mn: "540px" },
                { t: "panel", i: S.ORDERBOOK, s: "30%", mn: "280px" },
              ],
            },
            { t: "panel", i: S.DATA_LIST, s: "50%", cn: "oui-p-2" },
          ],
        },
        orderEntrySort(),
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
                { t: "panel", i: S.ORDERBOOK, s: "40%", mn: "280px" },
              ],
            },

            { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
          ],
        },
        orderEntrySort(),
      ],
    },
    HORIZONTAL_MARKETS_BOTTOM_PANEL,
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
      // s: "70%",
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
          s: "55%",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "75%", mn: "540px" },
            { t: "panel", i: S.ORDERBOOK, s: "25%", mn: "280px" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "45%", cn: "oui-p-2" },
      ],
    },
    orderEntrySort(),
  ],
};

/** Advanced-right rules: orderEntry on right at all breakpoints. */
const exchangeStyleRightMarketsLeftRule: CRule = {
  lg: lgRightMarketsLeftTree,
  md: mdRightMarketsLeftTree,
  sm: smRightMarketsLeftTree,
  xs: xsRightMarketsLeftTree,
};

const exchangeStyleRightMarketsTopRule: CRule = {
  lg: lgRightMarketsTopTree,
  md: mdRightMarketsTopTree,
  sm: smRightMarketsTopTree,
  xs: xsRightMarketsTopTree,
};

const exchangeStyleRightMarketsBottomRule: CRule = {
  lg: lgRightMarketsBottomTree,
  md: mdRightMarketsBottomTree,
  sm: smRightMarketsBottomTree,
  xs: xsRightMarketsBottomTree,
};

const exchangeStyleRightMarketsHideRule: CRule = {
  lg: lgRightMarketsHideTree,
  md: mdRightMarketsHideTree,
  sm: smRightMarketsHideTree,
  xs: xsRightMarketsHideTree,
};

// ─────────────────────────────────────────────────────────────────────────────
// Advanced-left layout trees (lg breakpoint) – 1680px+
// ─────────────────────────────────────────────────────────────────────────────

/** lg: orderEntry* left 25% | mainCol right 75%; markets left (no dedicated panel). */
const lgLeftMarketsLeftTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort(),
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
  o: "vertical",
  c: [
    HORIZONTAL_MARKETS_TOP_PANEL,
    {
      t: "split",
      o: "horizontal",
      c: [
        orderEntrySort(),
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
    },
  ],
};

/** lg: orderEntry* left | mainCol right; markets bottom in mainCol. */
const lgLeftMarketsBottomTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort(),
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
    orderEntrySort(),
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
    orderEntrySort(),
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
          s: "60%",
          mx: "540px",
          mn: "480px",
          c: [
            { t: "panel", i: S.TRADING_VIEW, s: "65%", mn: "540px" },
            { t: "panel", i: S.ORDERBOOK, s: "35%", mn: "280px" },
            {
              t: "panel",
              i: S.MARKETS,
              s: "fixed",
              mn: "70px",
              mx: "280px",
              cl: true,
              dc: true,
              cn: "oui-ml-2",
            },
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
  o: "vertical",
  c: [
    HORIZONTAL_MARKETS_TOP_PANEL,
    {
      t: "split",
      o: "horizontal",
      c: [
        orderEntrySort(),
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
              c: [
                { t: "panel", i: S.TRADING_VIEW, s: "65%", mn: "540px" },
                { t: "panel", i: S.ORDERBOOK, s: "35%", mn: "280px" },
              ],
            },
            { t: "panel", i: S.DATA_LIST, s: "40%", cn: "oui-p-2" },
          ],
        },
      ],
    },
  ],
};

/** md: orderEntry* left | mainCol right; markets bottom in mainCol. */
const mdLeftMarketsBottomTree: CNode = {
  t: "split",
  o: "horizontal",
  c: [
    orderEntrySort(),
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
            { t: "panel", i: S.ORDERBOOK, s: "40%", mn: "280px" },
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
    orderEntrySort(),
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
            { t: "panel", i: S.ORDERBOOK, s: "40%", mn: "280px" },
          ],
        },
        { t: "panel", i: S.DATA_LIST, s: "30%", cn: "oui-p-2" },
      ],
    },
  ],
};

/** Advanced-left rules: orderEntry on left at all breakpoints. */
const exchangeStyleLeftMarketsLeftRule: CRule = {
  lg: lgLeftMarketsLeftTree,
  md: mdLeftMarketsLeftTree,
  sm: smLeftMarketsLeftTree,
  xs: xsLeftMarketsLeftTree,
};

const exchangeStyleLeftMarketsTopRule: CRule = {
  lg: lgLeftMarketsTopTree,
  md: mdLeftMarketsTopTree,
  sm: smLeftMarketsTopTree,
  xs: xsLeftMarketsTopTree,
};

const exchangeStyleLeftMarketsBottomRule: CRule = {
  lg: lgLeftMarketsBottomTree,
  md: mdLeftMarketsBottomTree,
  sm: smLeftMarketsBottomTree,
  xs: xsLeftMarketsBottomTree,
};

const exchangeStyleLeftMarketsHideRule: CRule = {
  lg: lgLeftMarketsHideTree,
  md: mdLeftMarketsHideTree,
  sm: smLeftMarketsHideTree,
  xs: xsLeftMarketsHideTree,
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
