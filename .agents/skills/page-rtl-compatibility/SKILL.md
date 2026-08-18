---
name: page-rtl-compatibility
description: Add or review RTL compatibility for Orderly Web pages and components. Use this skill whenever the user asks to make a page/component support RTL, Arabic/Farsi/Hebrew, direction switching, mirrored layout, RTL bugs, or compatibility with the feature/rtl implementation in this repository.
---

# Page RTL Compatibility

Use this skill to add RTL compatibility for pages, components, tables, charts, modals, trading modules, etc. in Orderly Web. The goal is not simply to flip the page, but to ensure that visual direction, interaction direction, number display, charts, scrolling, and third-party components all work correctly on top of the existing `html[dir]` and `useDocumentDirection()` foundation.

## Scope

This skill is responsible only for RTL compatibility at the page and component level, not for implementing or modifying global direction infrastructure.

- Do not add or rewrite the direction sync logic of `syncDocumentDirection`, `isRTLDirectionLanguage`, or `LanguageProvider`.
- Do not add RTL language entries, locale files, or date-fns locale mappings unless the user explicitly requests language integration.
- Assume the project already has `html[dir]` and `useDocumentDirection()` from `@orderly.network/ui`; pages should consume them directly when direction judgment is needed.

## Workflow

1. First, identify the target scope: page entry, desktop/mobile variants, dependent shared components, table column configurations, dropdown/sheet/dialog, charts, or canvas/poster.
2. Search for physical direction patterns: `left`, `right`, `ml`, `mr`, `pl`, `pr`, `rounded-l`, `rounded-r`, `border-l`, `border-r`, `text-left`, `text-right`, `space-x`, absolute `left/right` style, SVG/text `textAnchor`, scroll `scrollLeft`.
3. When logical direction can be used, prioritize replacing with logical direction; only fix to LTR for explicit financial/chart/numeric scenarios.
4. For components that need to change behavior based on direction, use `useDocumentDirection()` to get the direction; do not read global state yourself.
5. After modification, perform at least static checks: grep for remaining physical direction classes, check for accidental changes to numeric directions, run lint/build for the related package or the target storybook page (when feasible).

## Tailwind and Style Replacement Rules

Prioritize using Orderly's `oui-` prefixed logical direction classes:

| Physical Direction                              | RTL-Compatible Replacement                                          |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| `oui-ml-*` / `oui-mr-*`                         | `oui-ms-*` / `oui-me-*`                                             |
| `oui-pl-*` / `oui-pr-*`                         | `oui-ps-*` / `oui-pe-*`                                             |
| `oui-left-*` / `oui-right-*`                    | `oui-start-*` / `oui-end-*`                                         |
| `oui-text-left` / `oui-text-right`              | `oui-text-start` / `oui-text-end`                                   |
| `oui-border-l` / `oui-border-r`                 | `oui-border-s` / `oui-border-e`                                     |
| `oui-rounded-l-*` / `oui-rounded-r-*`           | `oui-rounded-s-*` / `oui-rounded-e-*` or corner-level `ss/se/es/ee` |
| `oui-space-x-*`                                 | `oui-gap-x-*` or `oui-gap-*`                                        |
| pseudo `before:left/right` / `after:left/right` | `before:oui-start/end` / `after:oui-start/end`                      |

Notes:

- `space-x` often causes spacing or border-radius overlap issues in RTL due to one-sided margins; prefer changing to `gap-x`.
- For complex border-radius, avoid hardcoding `rounded-tl/tr/bl/br`; use `rounded-ss/se/es/ee`. For example, the border-radius of two side-by-side cells in an order entry should be encapsulated with logical start/end corner helpers.
- If third-party/host styles override border-radius under `[dir="rtl"] :first-child`, you can use `!oui-rounded` or `!oui-rounded-md` to fix the component's own border-radius semantics.
- CSS variables, gradient angles, and financial colors generally do not need mirroring; only directional gradient shadows need to be rotated or swapped for RTL.

## Numbers, Prices, and Trading Symbols Stay LTR

Financial numbers, prices, quantities, percentages, order book cumulative values, addresses, IDs, and trading pair symbols must not be broken by Arabic/Hebrew text direction. Common approaches:

```tsx
<Text.numeral dp={dp} dir="ltr">
  {price}
</Text.numeral>
```

Or for SVG / chart labels:

```tsx
<text direction="ltr" unicodeBidi="plaintext">
  {value}
</text>
```

Rules:

- Prices, quantities, amounts, PnL, and percentages in tables and order books default to `dir="ltr"`.
- Text containers can follow the page RTL; the numbers themselves stay LTR.
- Check `Numeral`, `Text.numeral`, custom formatters, Token/Symbol display, wallet addresses, and tx hashes.
- Do not reverse buy/sell direction, up/down colors, or bid/ask semantics for RTL; only change layout and reading direction.

## When Components Need to Read Direction

Use when layout cannot be solved by CSS alone:

```tsx
import { useDocumentDirection } from "@orderly.network/ui";

const dir = useDocumentDirection();
const isRTL = dir === "rtl";
```

Applicable scenarios:

- Dropdown / popover `align` needs to switch from `start` to `end`, or from `end` to `start`.
- Icon + label reading order needs `direction={isRTL ? "rowReverse" : "row"}`.
- Selectors, token options, chain options, wallet selectors need left/right icon positions switched based on direction.
- Third-party components like tabs, Radix, TradingView that support `dir` / `direction` parameters need to receive the document direction.

Examples:

```tsx
<DropdownMenuContent align={isRTL ? "end" : "start"} />
<Flex direction={isRTL ? "rowReverse" : "row"} gapX={1} itemAlign="center" />
```

## Tables, Fixed Columns, and Horizontal Scrolling

Tables are a high-risk area for RTL compatibility. Reference the implementation approach in `packages/ui/src/table`:

- `useScroll` needs to detect `getComputedStyle(element).direction` and return `isRTL`.
- Do not use `scrollLeft > 0` or `scrollLeft + clientWidth >= scrollWidth` directly to judge left/right shadows; browsers have `default`, `negative`, and `reverse` `scrollLeft` models in RTL.
- Normalize to `fromStart` / `fromEnd` before determining leading/tailing shadows.
- Fixed columns prefer semantic values: `fixed: "start" | "end"`, then resolve to TanStack's `left` / `right` based on `isRTL`.
- Pinning styles use `insetInlineStart` / `insetInlineEnd`, not `left` / `right`.
- Pinned column shadows use `start/end` and rotate gradients based on `isRTL`.

If adding new table column configurations, prefer writing:

```ts
{
  fixed: "start";
}
{
  fixed: "end";
}
```

Only keep `"left"` / `"right"` when strongly bound to business semantics.

## ScrollIndicator, Tabs, and Horizontally Scrollable Areas

Horizontally scrollable tab bars, market lists, and filter chips need leading/tailing semantics:

- API naming uses `leading` / `tailing`, not `left` / `right` to indicate logical scroll direction.
- Scroll button positions can map to physical left/right based on `isRTL`, but click behavior should be based on `offsetFromStart`.
- Before `scrollTo({ left })`, convert logical offset to actual `scrollLeft` through the RTL scroll model.
- Containers use `oui-min-w-0 oui-flex-1` to avoid overflow in RTL/flex contexts.
- Tabs root node should receive `dir`; explicit `dir` takes precedence, otherwise use `useDocumentDirection()`.

## Charts, TradingView, Canvas/Poster

Charts typically need to stay LTR locally, but outer containers can follow page direction:

- Recharts / SVG axes: set `direction: ltr`, `unicode-bidi: plaintext` for chart or tick labels.
- Chart containers can use `style={{ direction: "ltr" }}` to prevent coordinate axes and number order from being affected by RTL.
- TradingView: pass the `direction` obtained from `useDocumentDirection()` into widget options, and add `dir={direction}` to the UI root node.
- In TradingView locale mapping, Arabic can be passed as `"ar"` directly; other unsupported locales should use existing fallbacks.
- Canvas/poster: pass `direction?: "ltr" | "rtl"` in `DrawOptions`. If the background image needs mirroring, wrap drawing with `ctx.save()`, `translate(width, 0)`, `scale(-1, 1)`, `restore()`; handle text/numbers and alignment separately by coordinates.

## Page and Component Checklist

When adapting pages, check by area; don't just change the first layer of JSX in the current file:

- Top navigation, sidebars, bottom navigation: absolute icons, external link icons, badges, arrows use `start/end`.
- Markets / watchlist / horizontal list: item spacing uses `me/ms/gap`, horizontal scroll controls support RTL.
- Portfolio / assets / orders / positions: stat cards, table columns, mobile list items, detail label/value alignment use `text-start/end`.
- Trading / order entry / order book: prices and quantities stay LTR, depth bar and pending dot use logical positions, qty/total input border-radius handled by logical corners.
- Transfer / wallet / chain/token select: dropdown align, token icon + name order, suffix absolute position switch based on direction.
- Dialog / Sheet / Select / Calendar / Pagination / Slider / Switch: first check if `packages/ui` base components are already compatible, avoid duplicating workarounds on every business page.

## Common Search Commands

```bash
rg -n "oui-(ml|mr|pl|pr|left|right|text-left|text-right|space-x|rounded-l|rounded-r|border-l|border-r)-|\b(left|right):|scrollLeft|textAnchor|dir=|direction" packages apps
rg -n "Text\.numeral|Numeral|formatting|formatString|wallet|address|tx|symbol" packages apps
rg -n "DropdownMenuContent|PopoverContent|Select|Tabs|ScrollIndicator|DataTable|fixed:" packages apps
```

## Pre-Completion Checklist

- [ ] Page has no obvious misalignment under both `html[dir="ltr"]` and `html[dir="rtl"]`.
- [ ] Physical direction classes have been replaced with `start/end`, `ms/me`, `ps/pe`, `text-start/end`, `gap` as much as possible.
- [ ] Numbers, prices, percentages, trading pairs, addresses/hashes stay LTR.
- [ ] Dropdown/popover alignment, icon+label order, suffix/prefix positions switch based on direction.
- [ ] Horizontal scroll, scroll shadow, tab indicator use leading/tailing semantics.
- [ ] Table fixed columns and shadows are correct in RTL direction.
- [ ] Charts, TradingView, canvas/poster are not breaking numbers or axes due to global RTL.
- [ ] Business semantics are not reversed: bid/ask, buy/sell, profit/loss, chart x-axis time order remain with original business meaning.
- [ ] Related package lint/build/test or Storybook smoke check has been run; if not run, explain why in the final response.
