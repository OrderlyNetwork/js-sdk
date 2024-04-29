import plugin from "tailwindcss/plugin";

export const colorPlugin = () =>
  plugin(function ({ addBase }) {
    addBase({
      ":root": {
        "--oui-primary": "182 79 255",
        "--oui-primary-light": "208 140 255",
        "--oui-primary-darken": "152 62 214",
        "--oui-primary-contrast": "255 255 255",

        "--oui-link": "182 79 255",
        "--oui-link-light": "208 140 255",

        "--oui-secondary": "255 255 255",
        "--oui-tertiary": "218 218 218",
        "--oui-quaternary": "218 218 218",
        /*--oui-disabled:2'18 218 218',*/

        "--oui-danger": "232 88 175",
        "--oui-danger-light": "255 103 191",
        "--oui-danger-darken": "199 68 146",
        "--oui-danger-contrast": "255 255 255",

        "--oui-success": "3 152 134",
        "--oui-success-light": "0 181 159",
        "--oui-success-darken": "0 119 105",
        "--oui-success-contrast": "255 255 255",

        "--oui-warning": "255 207 115",
        "--oui-warning-light": "255 207 115",
        "--oui-warning-darken": "117 88 33",
        "--oui-warning-contrast": "255 255 255",

        "--oui-fill": "36 32 47",
        "--oui-fill-active": "40 46 58",

        "--oui-base-100": "93 83 123",
        "--oui-base-200": "81 72 107",
        "--oui-base-300": "68 61 89",
        "--oui-base-400": "57 52 74",
        "--oui-base-500": "51 46 66",
        "--oui-base-600": "43 38 56",
        "--oui-base-700": "36 32 47",
        "--oui-base-800": "29 26 38",
        "--oui-base-900": "22 20 28",
      },
    });
  });
