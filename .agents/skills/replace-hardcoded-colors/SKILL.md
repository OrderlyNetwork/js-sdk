---
name: replace-hardcoded-colors
description: Audit or replace hardcoded UI colors with Orderly theme tokens in specified files, directories, or a clearly established component. Use for theme-mismatch investigations and color cleanup; preserve intentional fixed colors such as QR codes, logos, and artwork.
---

# Replace Hardcoded Colors

Use the current theme system, not a copied RGB palette. A literal color matching one preset does not prove which semantic token it represents.

## Scope and intent

- Use the file, directory, or component established by the request or conversation. If the target cannot be inferred safely, ask for it. Scan directories recursively; exclude generated output, dependencies, tests, snapshots, and comments unless requested.
- A request to **check, audit, explain, or report** is read-only. Apply changes only when the user asks to replace or fix colors. Do not expand from a named component to the whole repository without authorization.
- Before changing a match, determine whether it is an app/theme color or intentionally fixed identity/artwork (for example a QR code, third-party logo, medal, or illustration). Report uncertain cases instead of guessing.

## Current sources of truth

- `packages/ui/tailwind.config.js`: valid `oui-` color utilities and their CSS-variable bindings.
- `packages/ui/src/tailwind/theme/darkTheme.ts` and `lightTheme.ts`: built-in default dark and light variable values. `classicDarkTheme.ts` is another preset.
- `ThemeConfig.cssVars` in `packages/ui/src/provider/orderlyThemeContext.tsx`: consumer themes can override those variables at runtime. For Storybook-specific themes, inspect `apps/storybook/src/orderlyConfig/themes.ts` and the selected theme file under `apps/storybook/src/theme/`.
- Theme values are space-separated RGB channels (for example `"156 117 255"`). There is no single canonical RGB-to-token lookup table. Read the current files when exact values matter.

For token roles and non-obvious examples, read [reference.md](reference.md).

## Audit

Search relevant `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, and `.scss` files for:

- Literal hex, `rgb`/`rgba`/`hsl`/`hsla` values, including gradients, inline styles, canvas colors, and third-party color configuration.
- Tailwind arbitrary color utilities such as `oui-bg-[#...]`, plus literal white/black/gray utility colors and their opacity variants.
- SVG `fill`, `stroke`, and `stopColor` literals, including string-literal JSX expressions. Inspect `fillOpacity`/`strokeOpacity` together with the color. Ignore `none`, `currentColor`, `url(#...)`, and dynamic props unless their source resolves to a literal.

Inspect component color props before treating them as literals: a prop such as `color="white"` may map to a theme token internally. Classify each finding as theme mismatch, intentional fixed color, or requiring design/context confirmation. Do not count comments or tests as active UI.

## Choose a replacement

1. Choose by **semantic role and surrounding surface**, not RGB distance alone. Primary accents use `primary`; text/icons on a primary-filled surface use `primary-contrast`. Normal text and neutral surfaces use the appropriate `base-*`, `base-contrast-*`, or `line-*` tokens. Trading profit/loss use `trade-profit`/`trade-loss` when those semantics apply.
2. If changing a background, review its text, icons, borders, hover/disabled states, and gradients as a set. A token that works in dark mode may lose contrast in light or consumer themes. `base-static` is intentionally stable across themes; `base-contrast` follows the theme foreground.
3. Prefer an existing `oui-` class when `className` is available. Confirm the class exists in `packages/ui/tailwind.config.js`; use a supported opacity suffix or arbitrary form such as `/[0.54]` when needed. Do not assume every integer opacity (for example `/54`) generates CSS.
4. For a single-color SVG, prefer `fill="currentColor"` plus a theme text class on the SVG, merging any caller-provided `className`; remove the child literal fill. For multicolor or branded artwork, preserve the design unless the user explicitly requests a theme variant.
5. Use a CSS variable when a class cannot be used. Because `--oui-color-*` values contain space-separated RGB channels, write `rgb(var(--oui-color-primary))` or `rgb(var(--oui-color-primary) / 0.15)`. **Do not write** `rgba(var(--oui-color-primary), 0.15)`: it mixes space-separated channels with legacy comma syntax. Existing valid variable-based `rgb(... / α)` or Tailwind arbitrary-value syntax may be preserved.
6. For a semantic gradient, use the appropriate `--oui-gradient-*-start`/`-end` variables while preserving its direction, stop positions, and alpha. Do not replace an arbitrary multi-stop artwork gradient merely because one stop matches a preset.

If the semantic role is unclear or no suitable token exists, report the ambiguity and ask for a design choice before making a visually significant substitution.

## Verify and report

- Re-scan the target for relevant remaining literals and confirm changed SVGs have no child fill overriding the new theme class.
- Check formatting and the relevant build/style generation when available. Verify classes are generated, especially arbitrary opacity classes.
- Check dark, light, and relevant custom themes in proportion to the change; inspect foreground/background contrast rather than color alone.
- Report what changed, what was intentionally left fixed, and any checks blocked by existing environment or repository errors. For read-only audits, report findings without editing.
