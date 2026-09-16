import plugin from "tailwindcss/plugin";

const BUTTON_PRIMARY_RGB = "103 0 206";

/**
 * Orderly Design System v2 dark palette — the SDK default dark theme.
 *
 * Uses the Manrope type stack. Every gradient slot resolves to a flat
 * semantic color, so gradient-driven treatments (brand buttons, gradient
 * text) render as solid fills under this preset. Consumers that need
 * visible gradients should use `CLASSIC_DARK_THEME_CSS_VARS` or define
 * their own `cssVars`.
 */
export const DARK_THEME_CSS_VARS = {
  "--oui-font-family":
    '"Manrope", "PingFang SC", "Noto Sans CJK SC", "Noto Sans", sans-serif',

  /* Orderly brand colors */
  "--oui-color-primary": "156 117 255",
  "--oui-color-primary-light": "156 117 255",
  /* Orderly UI buttons consume the legacy `primary-darken` slot. */
  "--oui-color-primary-darken": BUTTON_PRIMARY_RGB,
  "--oui-color-primary-contrast": "255 255 255",

  "--oui-color-link": "156 117 255",
  "--oui-color-link-light": "156 117 255",

  "--oui-color-secondary": "255 255 255",
  "--oui-color-tertiary": "132 131 136",
  "--oui-color-quaternary": "98 96 102",

  /* Status colors retain their existing product meanings. */
  "--oui-color-danger": "233 77 122",
  "--oui-color-danger-light": "233 77 122",
  "--oui-color-danger-darken": "233 77 122",
  "--oui-color-danger-contrast": "9 6 16",

  "--oui-color-success": "2 181 137",
  "--oui-color-success-light": "2 181 137",
  "--oui-color-success-darken": "2 181 137",
  "--oui-color-success-contrast": "9 6 16",

  "--oui-color-warning": "217 171 82",
  "--oui-color-warning-light": "217 171 82",
  "--oui-color-warning-darken": "217 171 82",
  "--oui-color-warning-contrast": "9 6 16",

  "--oui-color-fill": "29 25 41",
  "--oui-color-fill-active": "43 39 54",

  "--oui-color-base-1": "57 53 65",
  "--oui-color-base-2": "57 53 65",
  "--oui-color-base-3": "29 25 41",
  "--oui-color-base-4": "43 39 54",
  "--oui-color-base-5": "43 39 54",
  "--oui-color-base-6": "43 39 54",
  "--oui-color-base-7": "29 25 41",
  "--oui-color-base-8": "25 22 36",
  "--oui-color-base-9": "19 14 29",
  "--oui-color-base-10": "9 6 16",

  "--oui-color-base-foreground": "255 255 255",
  "--oui-color-line": "255 255 255",

  "--oui-color-base-static": "255 255 255",
  "--oui-color-base-static-contrast": "0 0 0",

  "--oui-color-trading-loss": "233 77 122",
  "--oui-color-trading-loss-contrast": "9 6 16",
  "--oui-color-trading-profit": "2 181 137",
  "--oui-color-trading-profit-contrast": "9 6 16",

  /* Gradient slots intentionally resolve to flat semantic colors. */
  "--oui-gradient-primary-start": "156 117 255",
  "--oui-gradient-primary-end": "156 117 255",

  "--oui-gradient-secondary-start": "156 117 255",
  "--oui-gradient-secondary-end": "156 117 255",

  "--oui-gradient-success-start": "2 181 137",
  "--oui-gradient-success-end": "2 181 137",

  "--oui-gradient-danger-start": "233 77 122",
  "--oui-gradient-danger-end": "233 77 122",

  "--oui-gradient-warning-start": "217 171 82",
  "--oui-gradient-warning-end": "217 171 82",

  "--oui-gradient-neutral-start": "29 25 41",
  "--oui-gradient-neutral-end": "29 25 41",

  "--oui-gradient-brand-start": "156 117 255",
  "--oui-gradient-brand-end": "156 117 255",
  "--oui-gradient-brand-stop-start": "6.62%",
  "--oui-gradient-brand-stop-end": "86.5%",
  "--oui-gradient-brand-angle": "17.44deg",

  /* rounded */
  "--oui-rounded-sm": "2px",
  "--oui-rounded": "4px",
  "--oui-rounded-md": "6px",
  "--oui-rounded-lg": "8px",
  "--oui-rounded-xl": "12px",
  "--oui-rounded-2xl": "16px",
  "--oui-rounded-full": "9999px",

  /* spacing */
  "--oui-spacing-xs": "20rem",
  "--oui-spacing-sm": "22.5rem",
  "--oui-spacing-md": "26.25rem",
  "--oui-spacing-lg": "30rem",
  "--oui-spacing-xl": "33.75rem",
};

export type ThemeCssVars = typeof DARK_THEME_CSS_VARS;

export const darkThemePlugin = () =>
  plugin(function ({ addBase }) {
    addBase({
      ":root": DARK_THEME_CSS_VARS,
    });
  });
