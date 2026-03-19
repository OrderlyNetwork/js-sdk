# Replace Hardcoded Colors — Reference

## When to use class name vs CSS variable

| Context                                                                                    | Use                                                      | Example                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| React `className`, element that accepts classes                                            | Tailwind class (oui-\*)                                  | `className="oui-text-primary oui-bg-base-5"`                                                                                                                                               |
| SVG `fill` / `stroke` on element that supports `className`                                 | Tailwind class                                           | `className="oui-fill-base-contrast"`                                                                                                                                                       |
| **Single-color SVG** previously using `fill="rgb(var(--oui-color-*))"` + `fillOpacity="…"` | Prefer Tailwind class on `<svg>`                         | On `<svg>`: `fill="currentColor"` + `className="oui-fill-base-contrast-54"`; remove `fill`/`fillOpacity` from child `<path>` etc.                                                          |
| **Literal SVG** `fill` / `fillOpacity` (e.g. `fill="white"`, `fillOpacity="0.98"`)         | Tailwind class on `<svg>` + `fill="currentColor"`        | On `<svg>`: `className="oui-text-base-contrast"` (or `oui-fill-base-contrast`), `fill="currentColor"`; remove literal fill/fillOpacity from svg and children.                              |
| Inline `style` prop, style object                                                          | CSS variable                                             | `style={{ color: 'rgb(var(--oui-color-primary))' }}`                                                                                                                                       |
| Third-party API expecting color string (e.g. chart config)                                 | CSS variable                                             | `color: 'rgb(var(--oui-color-trading-profit))'`                                                                                                                                            |
| Custom alpha in `style`                                                                    | CSS variable; **when original was rgba**, use comma only | `rgba(var(--oui-color-success), 0.15)` — do **not** convert to slash. If the file already uses `rgb(var(--oui-*)/α)` or `_/_α`, preserve it; do **not** change to `rgba(var(--oui-*), α)`. |
| Tailwind opacity suffix available                                                          | Class                                                    | `oui-bg-primary/80`, `oui-text-base-contrast-54`                                                                                                                                           |
| `linear-gradient` with two theme-matching stops                                            | CSS variables (start/end)                                | `linear-gradient(90deg, rgb(var(--oui-gradient-primary-start)), rgb(var(--oui-gradient-primary-end)))`                                                                                     |
| **Tailwind 类中写死 white/black**                                                          | Always use theme class                                   | Replace with theme classes (e.g. `oui-bg-line-6`, `oui-text-base-contrast`); do not use `oui-text-white`, `oui-bg-black`, etc.                                                             |

## Before applying

- Use the **Checklist before applying** in [SKILL.md](.cursor/skills/replace-hardcoded-colors/SKILL.md) to verify each replacement type (class vs CSS variable, rgba comma syntax, gradient direction preserved).
- Literal SVG `fill` and `fillOpacity` are in scope: replace with theme class (e.g. `oui-text-base-contrast`) on `<svg>` and `fill="currentColor"`.

## Source files

- **Color values**: [apps/storybook/src/tailwind/customTheme.ts](apps/storybook/src/tailwind/customTheme.ts)
- **Class names**: [packages/ui/tailwind.config.js](packages/ui/tailwind.config.js) — `theme.extend.colors`, prefix `oui-`
- **Variable list (default theme)**: [.cursor/skills/theme-designer/variables.md](.cursor/skills/theme-designer/variables.md) — same variable names; values may differ by theme.
- **Full color & gradient tables (for exact match)**: [.cursor/skills/replace-hardcoded-colors/SKILL.md](.cursor/skills/replace-hardcoded-colors/SKILL.md) — customTheme color reference and gradient reference.
