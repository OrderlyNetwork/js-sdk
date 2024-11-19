import plugin from "tailwindcss/plugin";

export const themePlugin = () =>
  plugin(function ({ addBase }) {
    addBase({
      ":root": {
        "--oui-font-family": '"Manrope", sans-serif',
 
        /* colors */
        "--oui-color-primary": "176 132 233",
        "--oui-color-primary-light": "213 190 244",
        "--oui-color-primary-darken": "137 76 209",
        "--oui-color-primary-contrast": "255 255 255",

        "--oui-color-link": "189 107 237",
        "--oui-color-link-light": "217 152 250",

        "--oui-color-secondary": "255 255 255",
        "--oui-color-tertiary": "218 218 218",
        "--oui-color-quaternary": "218 218 218",

        "--oui-color-danger": "245 97 139",
        "--oui-color-danger-light": "250 167 188",
        "--oui-color-danger-darken": "237 72 122",
        "--oui-color-danger-contrast": "255 255 255",

        "--oui-color-success": "41 233 169",
        "--oui-color-success-light": "101 240 194",
        "--oui-color-success-darken": "0 161 120",
        "--oui-color-success-contrast": "255 255 255",

        "--oui-color-warning": "255 209 70",
        "--oui-color-warning-light": "255 229 133",
        "--oui-color-warning-darken": "255 152 0",
        "--oui-color-warning-contrast": "255 255 255",

        "--oui-color-fill": "36 32 47",
        "--oui-color-fill-active": "40 46 58",

        "--oui-color-base-1": "93 83 123",
        "--oui-color-base-2": "81 72 107",
        "--oui-color-base-3": "68 61 69",
        "--oui-color-base-4": "57 52 74",
        "--oui-color-base-5": "51 46 66",
        "--oui-color-base-6": "43 38 56",
        "--oui-color-base-7": "32 36 47",
        "--oui-color-base-8": "29 26 38",
        "--oui-color-base-9": "22 20 28",
        "--oui-color-base-10": "14 13 18",

        "--oui-color-base-foreground": "255 255 255",
        "--oui-color-line": "255 255 255",

        "--oui-color-trading-loss": "245 97 139",
        "--oui-color-trading-loss-contrast": "255 255 255",
        "--oui-color-trading-profit": "41 233 169",
        "--oui-color-trading-profit-contrast": "255 255 255",

        /* gradients */
        "--oui-gradient-primary-start": "231 219 249",
        "--oui-gradient-primary-end": "159 107 225",

        "--oui-gradient-secondary-start": "81 42 121",
        "--oui-gradient-secondary-end": "176 132 233",

        "--oui-gradient-success-start": "1 83 68",
        "--oui-gradient-success-end": "41 223 169",

        "--oui-gradient-danger-start": "153 24 76",
        "--oui-gradient-danger-end": "245 97 139",

        "--oui-gradient-brand-start": "38 254 255",
        "--oui-gradient-brand-end": "89 176 254",
        
        "--oui-gradient-warning-start": "152 58 8",
        "--oui-gradient-warning-end": "255 209 70",

        "--oui-gradient-neutral-start": "27 29 24",
        "--oui-gradient-neutral-end": "38 41 46",

        // Spacing
        "--oui-spacing-xs": "20rem",
        "--oui-spacing-sm": "22.5rem",
        "--oui-spacing-md": "26.25rem",
        "--oui-spacing-lg": "30rem",
        "--oui-spacing-xl": "33.75rem",
      },
    });
  });
