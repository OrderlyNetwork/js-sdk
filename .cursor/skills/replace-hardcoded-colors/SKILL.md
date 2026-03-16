---

name: replace-hardcoded-colors
description: Finds hardcoded color values (hex, rgb, rgba) in a specified directory, a single file, or multiple files and replaces them with theme variables from apps/storybook/src/tailwind/customTheme.ts. Prefers Tailwind class names (oui-*) from packages/ui/tailwind.config.js when the context allows; otherwise uses CSS variables (e.g. rgb(var(--oui-color-primary)) or rgba with alpha). When the original was rgba, keep the comma syntax: rgba(var(--oui-color-*), alpha); do not convert to slash syntax. When code already uses rgb(var(--oui-*)/α) or rgb(var(--oui-*)_/_α), do not convert to rgba(var(--oui-*), α). When no exact match exists, uses the closest theme color by semantics or RGB distance. Use when the user asks to find or replace hardcoded colors in a directory/file(s), or to align colors with customTheme.

---

# Replace Hardcoded Colors with Theme Variables

## Scope

- **Color source**: [apps/storybook/src/tailwind/customTheme.ts](apps/storybook/src/tailwind/customTheme.ts) only. All replacement values come from its `--oui-color-*` and gradient variables.
- **Tailwind reference**: [packages/ui/tailwind.config.js](packages/ui/tailwind.config.js). Use its `theme.extend.colors` (prefix `oui-`) to decide valid class names and when to use class vs CSS variable.
- **Target**: User may specify **one of**:
  - **Directory**: Scan that directory and its subdirectories (recursively). Include only relevant files (e.g. `.tsx`, `.ts`, `.jsx`, `.js`, `.css`); exclude `node_modules`, `dist`, and similar.
  - **Single file**: One file path (e.g. `apps/storybook/src/foo.tsx`). Scan only that file.
  - **Multiple files**: A list of file paths. Scan only those files; no recursive directory scan.
    If the user gives neither a directory nor any file path(s), ask. Example: "Which directory or which file(s) should I scan for hardcoded colors?"

## Workflow

1. **Confirm target**  
   If the user did not specify a target, ask. Accept:
   - **Directory**: e.g. `packages/ui/src` — scan recursively.
   - **Single file**: e.g. `apps/storybook/src/orderlyConfig/components/VaultsTabContent.tsx`.
   - **Multiple files**: e.g. `file1.tsx`, `file2.tsx` (or a list). Scan only those files.
     Example prompt: "Which directory or which file(s) should I scan for hardcoded colors?"

2. **Build color map from customTheme**  
   Parse `apps/storybook/src/tailwind/customTheme.ts` and build a map: normalized RGB (and optional hex) → variable name (e.g. `96 140 255` / `#608CFF` → `--oui-color-primary`). Use the table below if parsing is not possible.

3. **Find hardcoded colors**  
   In the chosen **directory** (all relevant files under it, recursively) or in the specified **file(s)** (only those paths), search for:
   - Hex: `#RGB`, `#RRGGBB`, `#RRGGBBAA`
   - Functions: `rgb(...)`, `rgba(...)`, `hsl(...)`, `hsla(...)`
   - Gradients: `linear-gradient(...)` (or similar) with hex/rgb color stops — replace using the **Gradient replacement** section.
   - **Tailwind 写死颜色类**: Search for `oui-*` utility classes where the color is the **literal white/black** (not a theme token). Include: text (`oui-text-white`, `oui-text-black`, and opacity variants like `oui-text-white/80`, `oui-text-black/[0.88]`); background (`oui-bg-white`, `oui-bg-black`, `oui-bg-white/[0.06]`, `oui-bg-white/[0.16]`, `oui-bg-black/80`, etc.); border (`oui-border-white`, `oui-border-black` and opacity variants); fill (`oui-fill-white`, `oui-fill-black` and opacity variants). Match both Tailwind opacity styles: `/0.06`, `/[0.06]`, `/[.06]`, etc.
   - **SVG 属性**: In TSX/JSX, search for:
     - `fill="..."` with literal color values: `fill="white"`, `fill="black"`, `fill="#RRGGBB"`, `fill="#RGB"`, etc. (include both quoted and `fill={...}` when the value is a string literal).
     - `fillOpacity="..."` or `fillOpacity={...}` with numeric/string literals (e.g. `"0.98"`, `"1"`, `0.98`).
       Skip: `fill="none"`, `fill="currentColor"`, and `fill="url(#...)"` (gradient/pattern refs). Do not treat dynamic expressions (e.g. `fillOpacity={opacity}` where `opacity` is a prop) as hardcoded unless the default is a literal.
       **SVG fill/fillOpacity replacement**: When an `<svg>` (or a single dominant path/group) has **only** a single hardcoded fill + optional fillOpacity: (1) On the `<svg>`: add or merge `className` with the appropriate theme class; set `fill="currentColor"` so children inherit. (2) Remove `fill` and `fillOpacity` from the `<svg>` and from child elements that duplicated the same color. **Mapping** (same semantics as Tailwind 写死颜色类): `fill="white"` + `fillOpacity="0.98"` (or no fillOpacity / 1) → `oui-text-base-contrast` (or `oui-fill-base-contrast`). `fill="white"` + other opacity → use closest `oui-fill-base-contrast-*` (80, 54, 36, 30, 20, 16, 12, 10, 8, 6, 4). `fill="black"` (and variants) → `oui-fill-base-10` or `oui-fill-base-contrast` by context. Other hex/rgb fill → normalize to RGB and use exact/closest theme variable; if a class is used, prefer `oui-fill-*` with `fill="currentColor"`. Icon can use **either** `oui-text-base-contrast` (icon follows text color) or `oui-fill-base-contrast` (icon uses fill token).
       **Skip**: Commented-out code; non-style uses (hex in IDs, version strings, URLs, regex patterns containing `#`); test/snapshot files (e.g. `__snapshots__`, `*.test.*`, `*.spec.*`) unless the user asks to include them; color values inside `data-*` or `aria-*` attributes unless clearly used for styling. If the user explicitly asks to replace colors inside comments or tests, do so as an exception.

4. **Match and choose replacement**
   - Normalize each value to RGB (for gradients, normalize both stops).
   - **Exact match**: If RGB equals a customTheme color/gradient variable value, use that variable (for gradients, use the pair `--oui-gradient-*-start` / `-end`).
   - **No exact match**: Prefer **semantic** match (e.g. profit/success green → `--oui-color-success` / `--oui-color-trading-profit`; loss/danger red → `--oui-color-danger` / `--oui-color-trading-loss`; primary blue/purple → `--oui-color-primary` / `--oui-color-link`; neutrals → `--oui-color-base-*`). If unclear, use smallest RGB distance to a theme color.
   - Note in the replacement whether it was "exact" or "closest (semantic/distance)".

4a. **Summarize (optional before applying)**  
 List how many findings per file and by type (hex/rgb, Tailwind white/black classes, gradients, SVG fill/fillOpacity). If there are many files, ask whether to apply all or start with a subset (e.g. one directory or only Tailwind classes).

### Tailwind 写死颜色类的替换

When you find **Tailwind hardcoded color classes** (oui-_-white, oui-_-black), replace them with theme classes per the table below. **line** in tailwind.config.js has: 4 (0.04), 6 (0.06), DEFAULT (0.08), 10 (0.10), 12 (0.12), 16 (0.16). **base.contrast** has: DEFAULT (0.98), 80, 54, 36, 30, 20, 16, 12, 10, 8, 6, 4 — use for text/icon opacity.

| Original (hardcoded)                             | Replace with (theme class)                                                                                                                           | Notes                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `oui-text-white`                                 | `oui-text-base-foreground` or `oui-text-base-contrast`                                                                                               | White text; base.foreground semantics                                   |
| `oui-text-black`                                 | `oui-text-base-contrast` (primary text) or `oui-text-base-10` by context                                                                             | Black text: primary → base-contrast; on light → base-10                 |
| `oui-bg-white`                                   | `oui-bg-secondary` or `oui-bg-base-foreground`                                                                                                       | Solid white bg; customTheme secondary/base-foreground = 255 255 255     |
| `oui-bg-black`                                   | `oui-bg-base-10` or `oui-bg-fill`                                                                                                                    | Dark bg; pick darkest by semantics                                      |
| `oui-bg-white/[0.04]`, `oui-bg-white/[.04]`      | `oui-bg-line-4`                                                                                                                                      | line-4 = 0.04                                                           |
| `oui-bg-white/[0.06]`, `oui-bg-white/[.06]`      | `oui-bg-line-6`                                                                                                                                      | line-6 = 0.06                                                           |
| `oui-bg-white/[0.08]` (0.08)                     | `oui-bg-line` (DEFAULT)                                                                                                                              | line DEFAULT = 0.08                                                     |
| `oui-bg-white/[0.10]`, `oui-bg-white/[.10]`      | `oui-bg-line-10`                                                                                                                                     | line-10 = 0.10                                                          |
| `oui-bg-white/[0.12]`                            | `oui-bg-line-12`                                                                                                                                     | line-12 = 0.12                                                          |
| `oui-bg-white/[0.16]`                            | `oui-bg-line-16`                                                                                                                                     | line-16 = 0.16                                                          |
| Other white/α (e.g. 0.2, 0.3, 0.5, 0.8)          | Use `oui-bg-base-contrast-{closest}` (80/54/36/30/20/16/12/10/8/6/4) or `oui-bg-line-*` + note "closest (opacity)"                                   | base.contrast has 80, 54, 36, 30, 20, 16, 12, 10, 8, 6, 4; DEFAULT 0.98 |
| `oui-bg-black/80`, `oui-bg-black/[0.08]` etc.    | Overlay: `oui-bg-base-10` or `oui-bg-fill`; need opacity → CSS variable or closest base                                                              | Common in dialog/sheet                                                  |
| `oui-border-white`                               | `oui-border-line` or `oui-border-base-foreground`                                                                                                    | White border                                                            |
| `oui-border-black`                               | `oui-border-base-10` or `oui-border-line` by context                                                                                                 | Dark border                                                             |
| `oui-fill-white` / `oui-fill-black`              | `oui-fill-base-foreground` / `oui-fill-base-10` etc.                                                                                                 | Same semantics as text/bg                                               |
| SVG `fill="white"` + `fillOpacity="0.98"` (or 1) | On `<svg>`: `className="oui-text-base-contrast"` (or `oui-fill-base-contrast`), `fill="currentColor"`; remove fill/fillOpacity from svg and children | Same semantics as oui-text-white / base.contrast DEFAULT                |

5. **Apply replacement (class first, then CSS variable)**
   - **Tailwind 写死颜色类**: If the finding is a **Tailwind hardcoded color class** (e.g. `oui-text-white`, `oui-bg-white/[0.06]`), replace it with the theme `oui-*` class from the **Tailwind 写死颜色类的替换** table above. Do **not** introduce new CSS variables or hex/rgb. If the opacity has no exact theme token, use the closest line/base-contrast key and note "closest (opacity)" in the replacement.
   - **Prefer Tailwind class** when the color is applied via something that supports `className` (e.g. React `className`, or an attribute that accepts classes). Use [packages/ui/tailwind.config.js](packages/ui/tailwind.config.js) as the single source of class names:
     - Colors: `primary`, `primary-light`, `primary-darken`, `primary-contrast`, `secondary`, `tertiary`, `quaternary`, `link`, `link-light`, `danger`, `danger-light`, `danger-darken`, `danger-contrast`, `warning`, `warning-light`, `warning-darken`, `warning-contrast`, `success`, `success-light`, `success-darken`, `success-contrast`, `base` (1–10), `base.contrast` (DEFAULT, 80, 54, 36, 30, 20, 16, 12, 10, 8, 6, 4 — opacity suffixes), `line` (4, 6, DEFAULT, 10, 12, 16 — opacities 0.04–0.16; pick by design or existing usage), `trade.loss`, `trade.profit` (each with DEFAULT, contrast).
     - Utility pattern: `oui-{bg|text|border|fill}-{color}`. Examples: `oui-bg-primary`, `oui-text-success`, `oui-fill-base-contrast`, `oui-text-base-contrast-54`, `oui-border-line`, `oui-text-trade-profit`, `oui-text-trade-loss`. Opacity: e.g. `oui-bg-primary/80` where supported.
   - **Single-color SVG**: (1) If an SVG (or its single path) **already** uses `fill="rgb(var(--oui-color-*))"` plus `fillOpacity="…"`, replace with the **Tailwind fill class** on the `<svg>`: e.g. `className="oui-fill-base-contrast-54"` with `fill="currentColor"` on the SVG so children inherit; remove `fill` and `fillOpacity` from child elements; map variable + opacity to the same oui-fill-\* token (e.g. `--oui-color-base-foreground` + 0.54 → `oui-fill-base-contrast-54`). (2) If an SVG uses **literal** `fill="white"` / `fill="black"` / hex etc. + `fillOpacity`, apply the same treatment: replace with `oui-text-base-contrast` or `oui-fill-base-contrast` (and opacity variants per the **Tailwind 写死颜色类的替换** table) + `fill="currentColor"` on the `<svg>`, and remove literal `fill`/`fillOpacity` from the svg and children. This keeps a single source of color and avoids duplicate CSS variable usage.
   - **Use CSS variable only** when a class cannot be used (inline `style`, object used for `style`, third-party API color string, SVG `fill`/`stroke` on elements that truly cannot take a class):
     - Solid: `rgb(var(--oui-color-primary))` (variable name always two dashes: `--oui-color-*`).
     - **With alpha (rgba)**: When the **original** was already `rgba(...)`, keep the **comma** syntax: `rgba(var(--oui-color-primary), 0.15)` — do **not** convert to slash syntax. For replacements that were originally rgba, use `rgba(var(--oui-color-*), alpha)` only. When the **existing** code already uses `rgb(var(--oui-color-*) / α)`, `rgb(var(--oui-gradient-*)/α)`, or the Tailwind arbitrary form `rgb(var(--oui-*)_/_α)`, **preserve** that form; do **not** rewrite to `rgba(var(--oui-*), α)`.

## customTheme color reference (for exact match)

Use this when not parsing customTheme.ts. Values are RGB space-separated; hex is derived for matching.

| Variable                            | RGB (customTheme) | Hex (approx) |
| ----------------------------------- | ----------------- | ------------ |
| --oui-color-primary                 | 96 140 255        | #608CFF      |
| --oui-color-primary-light           | 119 157 255       | #779DFF      |
| --oui-color-primary-darken          | 51 95 252         | #335FFC      |
| --oui-color-primary-contrast        | 255 255 255       | #FFFFFF      |
| --oui-color-link                    | 182 79 255        | #B64FFF      |
| --oui-color-link-light              | 208 140 255       | #D08CFF      |
| --oui-color-secondary               | 255 255 255       | #FFFFFF      |
| --oui-color-tertiary                | 218 218 218       | #DADADA      |
| --oui-color-quaternary              | 218 218 218       | #DADADA      |
| --oui-color-danger                  | 255 68 124        | #FF447C      |
| --oui-color-danger-light            | 255 68 124        | #FF447C      |
| --oui-color-danger-darken           | 217 45 107        | #D92D6B      |
| --oui-color-danger-contrast         | 255 255 255       | #FFFFFF      |
| --oui-color-success                 | 0 180 158         | #00B49E      |
| --oui-color-success-light           | 15 203 180        | #0FCBB4      |
| --oui-color-success-darken          | 0 134 118         | #008676      |
| --oui-color-success-contrast        | 255 255 255       | #FFFFFF      |
| --oui-color-warning                 | 255 182 93        | #FFB65D      |
| --oui-color-warning-light           | 255 207 139       | #FFCF8B      |
| --oui-color-warning-darken          | 255 125 0         | #FF7D00      |
| --oui-color-warning-contrast        | 255 255 255       | #FFFFFF      |
| --oui-color-fill                    | 36 32 47          | #24202F      |
| --oui-color-fill-active             | 40 46 58          | #282E3A      |
| --oui-color-base-1                  | 83 94 123         | #535E7B      |
| --oui-color-base-2                  | 74 83 105         | #4A5369      |
| --oui-color-base-3                  | 57 65 85          | #394155      |
| --oui-color-base-4                  | 51 57 72          | #333948      |
| --oui-color-base-5                  | 40 46 58          | #282E3A      |
| --oui-color-base-6                  | 32 37 47          | #20252F      |
| --oui-color-base-7                  | 27 32 40          | #1B2028      |
| --oui-color-base-8                  | 24 28 35          | #181C23      |
| --oui-color-base-9                  | 19 21 25          | #131519      |
| --oui-color-base-10                 | 7 8 10            | #07080A      |
| --oui-color-base-foreground         | 255 255 255       | #FFFFFF      |
| --oui-color-line                    | 255 255 255       | #FFFFFF      |
| --oui-color-trading-loss            | 255 68 124        | #FF447C      |
| --oui-color-trading-loss-contrast   | 255 255 255       | #FFFFFF      |
| --oui-color-trading-profit          | 0 180 158         | #00B49E      |
| --oui-color-trading-profit-contrast | 255 255 255       | #FFFFFF      |

## Gradient replacement

When you find a **gradient** (e.g. `linear-gradient(#608CFF, #1828C3)` or two hex/rgb stops that match a theme gradient):

1. Normalize both stops to RGB and look them up in the gradient table below (or in customTheme.ts).
2. If both stops exactly match a pair `--oui-gradient-*-start` / `--oui-gradient-*-end`, replace with:
   - `linear-gradient(..., rgb(var(--oui-gradient-primary-start)), rgb(var(--oui-gradient-primary-end)))` (or the matching gradient name: primary, secondary, success, danger, warning, neutral, brand). **Keep the original direction/angle** (e.g. `90deg`, `to right`) — only replace the color stops.
3. If only one stop matches or semantics suggest a theme gradient, use that theme’s start/end pair and note "closest (semantic)".

**customTheme gradient reference (RGB space-separated)**

| Variable                       | RGB         | Hex (approx) |
| ------------------------------ | ----------- | ------------ |
| --oui-gradient-primary-start   | 96 140 255  | #608CFF      |
| --oui-gradient-primary-end     | 24 40 195   | #1828C3      |
| --oui-gradient-secondary-start | 189 107 237 | #BD6BED      |
| --oui-gradient-secondary-end   | 85 13 169   | #550DA9      |
| --oui-gradient-success-start   | 0 180 158   | #00B49E      |
| --oui-gradient-success-end     | 0 90 79     | #005A4F      |
| --oui-gradient-danger-start    | 255 68 124  | #FF447C      |
| --oui-gradient-danger-end      | 121 20 56   | #791438      |
| --oui-gradient-warning-start   | 255 182 93  | #FFB65D      |
| --oui-gradient-warning-end     | 121 46 0    | #792E00      |
| --oui-gradient-neutral-start   | 38 41 46    | #26292E      |
| --oui-gradient-neutral-end     | 27 29 34    | #1B1D22      |
| --oui-gradient-brand-start     | 38 254 255  | #26FEFF      |
| --oui-gradient-brand-end       | 89 176 254  | #59B0FE      |

## Similar-color semantics (when no exact match)

- **Trading context** (PnL, order side, chart): prefer `--oui-color-trading-profit` / `--oui-color-trading-loss` over generic success/danger.
- Red/pink/danger → `--oui-color-danger` or `--oui-color-trading-loss`
- Green/success/profit → `--oui-color-success` or `--oui-color-trading-profit`
- Blue/purple/primary → `--oui-color-primary` or `--oui-color-link` (buttons/links: primary/link; neutral UI: base-\*).
- Orange/yellow → `--oui-color-warning`
- White/foreground → `--oui-color-base-foreground` or `--oui-color-primary-contrast`
- Grays/dark neutrals → `--oui-color-base-1` … `--oui-color-base-10` by lightness

## Checklist before applying

- [ ] Target confirmed (directory, single file, or multiple files). If directory: scan is recursive; only intended file types included. If file(s): only those paths are scanned.
- [ ] Each replacement is either exact (from customTheme map) or closest (semantic or distance), with reason noted.
- [ ] **Tailwind 写死颜色类**: Checked for `oui-{text|bg|border|fill}-white`, `oui-{text|bg|border|fill}-black`, and any opacity variants; if found, replaced per the **Tailwind 写死颜色类的替换** table (line, base-contrast, base-foreground, secondary, base-10, fill, etc.).
- [ ] Where `className` can be used, replacement is an `oui-*` class from tailwind.config.js.
- [ ] **Single-color SVG**: If SVG/path used `fill="rgb(var(--oui-color-*))"` + `fillOpacity`, or **literal** `fill`/`fillOpacity` (e.g. `fill="white"`, `fillOpacity="0.98"`), use `className="oui-fill-*"` or `oui-text-base-contrast` on `<svg>` with `fill="currentColor"`, and remove `fill`/`fillOpacity` from svg and child elements.
- [ ] **SVG 属性**: Checked for literal `fill` and `fillOpacity` on `<svg>` or children; if found, replaced with theme class on `<svg>` and `fill="currentColor"`.
- [ ] Where only style/CSS variable is possible, use `rgb(var(--oui-color-*))` or, when the original was rgba, `rgba(var(--oui-color-*), alpha)` (keep comma syntax; do not convert to slash); variable name uses two dashes (`--oui-color-*`). If the file already uses `rgb(var(--oui-*)/α)` or `_/_α` form, do not change to `rgba(..., α)`.
- [ ] If a gradient was replaced, use `--oui-gradient-*-start` and `--oui-gradient-*-end` from customTheme; variable names use two dashes.
