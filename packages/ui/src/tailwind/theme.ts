import plugin from "tailwindcss/plugin";

export const themePlugin = () =>
  plugin(function ({ addBase }) {
    addBase({
      ":root": {
        "--oui-font-family": '"Manrope", sans-serif',

        /* colors */
        "--oui-color-primary": "51 95 252",
        "--oui-color-primary-light": "96 140 255",
        "--oui-color-primary-darken": "152 62 214",
        "--oui-color-primary-contrast": "255 255 255",

        "--oui-color-link": "182 79 255",
        "--oui-color-link-light": "208 140 255",

        "--oui-color-secondary": "255 255 255",
        "--oui-color-tertiary": "218 218 218",
        "--oui-color-quaternary": "218 218 218",

        "--oui-color-danger": "217 45 107",
        "--oui-color-danger-light": "255 68 124",
        "--oui-color-danger-darken": "157 32 77,",
        "--oui-color-danger-contrast": "255 255 255",

        "--oui-color-success": "0 134 118",
        "--oui-color-success-light": "0 181 159",
        "--oui-color-success-darken": "0 119 105",
        "--oui-color-success-contrast": "255 255 255",

        "--oui-color-warning": "255 125 0",
        "--oui-color-warning-light": "255 207 115",
        "--oui-color-warning-darken": "117 88 33",
        "--oui-color-warning-contrast": "255 255 255",

        "--oui-color-fill": "36 32 47",
        "--oui-color-fill-active": "40 46 58",

        "--oui-color-base-1": "83 94 123",
        "--oui-color-base-2": "74 83 105",
        "--oui-color-base-3": "57 65 85",
        "--oui-color-base-4": "51 57 72",
        "--oui-color-base-5": "40 46 58",
        "--oui-color-base-6": "32 37 47",
        "--oui-color-base-7": "27 32 40",
        "--oui-color-base-8": "24 28 35",
        "--oui-color-base-9": "19 21 25",
        "--oui-color-base-10": "7 8 10",

        "--oui-color-base-foreground": "255 255 255",
        "--oui-color-line": "255 255 255",

        "--oui-color-trading-loss": "217 45 107",
        "--oui-color-trading-loss-contrast": "255 255 255",
        "--oui-color-trading-profit": "0 134 118",
        "--oui-color-trading-profit-contrast": "255 255 255",

        /* gradients */
        "--oui-gradient-primary-start": "96 140 255",
        "--oui-gradient-primary-end": "24 40 195",

        "--oui-gradient-success-start": "0 180 158",
        "--oui-gradient-success-end": "0 90 79",

        "--oui-gradient-danger-start": "255 68 124",
        "--oui-gradient-danger-end": "121 20 56",

        "--oui-gradient-warning-start": "255 182 93",
        "--oui-gradient-warning-end": "121 46 0",

        "--oui-gradient-neutral-start": "38 41 46",
        "--oui-gradient-neutral-end": "27 29 34",

        "--oui-gradient-brand-start": "38 254 255",
        "--oui-gradient-brand-end": "89 176 254",
      },
    });
  });