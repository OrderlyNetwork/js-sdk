# Orderly theme color reference

Read this when a hardcoded color has more than one plausible theme mapping. Verify details against the current source files; these are semantic examples, not a frozen palette.

## Token roles

| UI role                                                 | Candidate token or class                                                              | Check                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Brand accent or selected state                          | `oui-text-primary`, `oui-border-primary`, `oui-bg-primary`                            | Compare with nearby primary controls.                                                                 |
| Prominent primary-filled surface                        | `oui-bg-primary-darken` with `oui-text-primary-contrast`                              | Review all foreground and interaction states together.                                                |
| Standard foreground                                     | `oui-text-base-contrast` and its defined intensity variants, such as `-54`            | `--oui-color-base-foreground` is light in dark mode and dark in light mode.                           |
| Neutral surface                                         | `oui-bg-base-1` through `oui-bg-base-10`                                              | Select by component role, not numeric closeness; slots are not guaranteed to be a monotonic gradient. |
| Subtle divider or overlay                               | `oui-border-line-6`, `oui-bg-line-12`, etc.                                           | Use only when the literal really represents a line/overlay.                                           |
| Profit/loss                                             | `oui-text-trade-profit` / `oui-text-trade-loss`                                       | Prefer trading semantics over generic success/danger.                                                 |
| Status success/danger/warning                           | `oui-text-success`, `oui-text-danger`, `oui-text-warning` and related contrast tokens | Use the paired contrast token on a colored surface.                                                   |
| Deliberately fixed white/light or dark-on-light surface | `base-static` and `base-static-contrast` variants                                     | These remain stable across built-in themes; do not use for normal theme-adaptive text.                |

Source files: `packages/ui/tailwind.config.js`, `packages/ui/src/tailwind/theme/darkTheme.ts`, `lightTheme.ts`, `classicDarkTheme.ts`, and the active `ThemeConfig.cssVars` overrides. Storybook's blue-dark preset lives at `apps/storybook/src/theme/blueDarkTheme.ts`; its RGB values are not the default theme.

## Examples

- A blue literal on a selected control, such as `#608CFF`, can map to `oui-text-primary` when its role is the theme accent. Matching blue-dark's RGB value is evidence, not the decision rule.
- Replacing a hardcoded card background requires checking text/icons too. `oui-bg-primary-darken` with `oui-text-primary-contrast` is a possible pair; preserving chain-specific brand colors may instead require dedicated configurable tokens.
- A white translucent stripe is not automatically `oui-bg-line-*`. Confirm it is a neutral overlay and test it on light as well as dark surfaces.
- QR foreground/background, third-party logo colors, and rank-medal artwork often require fixed colors. Keep them unless the requested design explicitly changes them.

## CSS channels and alpha

Theme variables store `R G B` with spaces, for example `--oui-color-primary: 156 117 255`.

```css
/* Valid with this repository's variables */
color: rgb(var(--oui-color-primary));
background-color: rgb(var(--oui-color-primary) / 0.15);

/* Invalid after var() substitution: channels are space-separated, alpha is comma-separated */
background-color: rgba(var(--oui-color-primary), 0.15);
```

Tailwind utilities are preferable in `className` (`oui-text-primary`, `oui-bg-primary/80`). For nonstandard alpha, use a supported arbitrary suffix such as `oui-text-primary/[0.54]` and verify the generated CSS. Do not mechanically rewrite an existing valid comma-form color if it is not being converted to a space-separated theme variable.

## SVG and gradients

- For a one-color SVG, make the parent `fill="currentColor"`, add a semantic `oui-text-*` class, merge the caller's `className`, and remove child literal fills that would override inheritance. Keep intentional multicolor logos and illustrations intact.
- Gradient variables are semantic roles, not a guarantee of a visible two-color gradient: the default dark theme sets several start/end pairs to the same RGB. Preserve angle, stops, and opacity when substituting a theme gradient; inspect the result in active themes.
