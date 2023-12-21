import { getStorage } from "@/helper/storage";

export const defaultStyles = {
  "--orderly-color-primary": "182 79 255",
  "--orderly-color-primary-light": "208 140 255",
  "--orderly-color-primary-darken": "152 62 214",
  "--orderly-color-primary-contrast": "255 255 255",

  "--orderly-color-link": "182 79 255",

  "--orderly-color-secondary": "255 255 255",
  "--orderly-color-tertiary": "218 218 218",
  "--orderly-color-quaternary": "218 218 218",
  /*--orderly-color-disabled:218 218 218,*/

  "--orderly-color-danger": "232 88 175",
  "--orderly-color-danger-light": "255 103 191",
  "--orderly-color-danger-darken": "199 68 146",
  "--orderly-color-danger-contrast": "255 255 255",

  "--orderly-color-success": "3 152 134",
  "--orderly-color-success-light": "0 181 159",
  "--orderly-color-success-darken": "0 119 105",
  "--orderly-color-success-contrast": "255 255 255",

  "--orderly-color-warning": "255 207 115",
  "--orderly-color-warning-light": "229 199 0",
  "--orderly-color-warning-darken": "229 199 0",
  "--orderly-color-warning-contrast": "255 255 255",

  "--orderly-color-background": "27 32 40",
  "--orderly-color-background-contrast": "255 255 255",

  "--orderly-color-fill": "36 32 47",
  "--orderly-color-fill-active": "40 46 58",

  "--orderly-color-base-100": "93 83 123",
  "--orderly-color-base-200": "81 72 107",
  "--orderly-color-base-300": "68 61 89",
  "--orderly-color-base-400": "57 52 74",
  "--orderly-color-base-500": "51 46 66",
  "--orderly-color-base-600": "43 38 56",
  "--orderly-color-base-700": "36 32 47",
  "--orderly-color-base-800": "29 26 38",
  "--orderly-color-base-900": "22 20 28",

  "--orderly-color-popover": "43 38 56",
  "--orderly-color-popover-foreground": "255 255 255",

  "--orderly-color-base-foreground": "255 255 255",

  "--orderly-color-trading-loss": "255 103 194",
  "--orderly-color-trading-loss-contrast": "40 46 58",
  "--orderly-color-trading-profit": "0 181 159",
  "--orderly-color-trading-profit-contrast": "40 46 58",

  /* rounded */
  "--orderly-rounded": "6px",
  "--orderly-rounded-sm": "4px",
  "--orderly-rounded-lg": "8px",
  "--orderly-rounded-full": "9999px",

  "--orderly-button-shadow": "none",

  "--orderly-font-size-base": "16px",

  "--orderly-color-divider": "42 46 52",
};

export const getDefaultColors = () => {
  const data = getStorage("THEME_DOCUMENT");
  return {
    ...defaultStyles,
    ...data,
  };
};

export const mergeStyles = (key: string, value: string) => {
  return {
    ...defaultStyles,
    [key]: value,
  };
};
