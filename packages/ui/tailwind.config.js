const { withTV } = require("tailwind-variants/transformer");

const { sizePlugin } = require("./src/tailwind/size");
const { gradientPlugin } = require("./src/tailwind/gradient");
const { positionPlugin } = require("./src/tailwind/position");
const { basePlugin } = require("./src/tailwind/base");
const { componentsPlugin } = require("./src/tailwind/components");
const { themePlugin } = require("./src/tailwind/theme");
const { scrollBarPlugin } = require("./src/tailwind/scrollBar");
const { chartPlugin } = require("./src/tailwind/chart");

/** @type {import('tailwindcss').Config} */
module.exports = withTV({
  mode: "jit",
  darkMode: ["class"],
  content: [
    "./src/**/*.{ts,js,tsx,jsx}",
    "../ui-connector/src/**/*.{ts,js,tsx,jsx}",
    "../ui-orders/src/**/*.{ts,js,tsx,jsx}",
    "../ui-order-entry/src/**/*.{ts,js,tsx,jsx}",
    "../ui-positions/src/**/*.{ts,js,tsx,jsx}",
    "../ui-leverage/src/**/*.{ts,js,tsx,jsx}",
    "../ui-share/src/**/*.{ts,js,tsx,jsx}",
    "../trading-rewards/src/**/*.{ts,js,tsx,jsx}",
    "../portfolio/src/**/*.{ts,js,tsx,jsx}",
    "../ui-scaffold/src/**/*.{ts,js,tsx,jsx}",
    "../affiliate/src/**/*.{ts,js,tsx,jsx}",
    "../markets/src/**/*.{ts,js,tsx,jsx}",
    "../chart/src/**/*.{ts,js,tsx,jsx}",
    "../ui-transfer/src/**/*.{ts,js,tsx,jsx}",
    "../trading/src/**/*.{ts,js,tsx,jsx}",
    "../ui-order-entry/src/**/*.{ts,js,tsx,jsx}",
    "../ui-tpsl/src/**/*.{ts,js,tsx,jsx}",
    "../ui-tradingview/src/**/*.{ts,js,tsx,jsx}",
    "../ui-chain-selector/src/**/*.{ts,js,tsx,jsx}",
    "../wallet-connector/src/**/*.{ts,js,tsx,jsx}",
  ],
  prefix: "oui-",
  theme: {
    screens: {
      sm: "375px",
      md: "480px",
      lg: "768px",
      xl: "1024px",
      "2xl": "1280px",
      "3xl": "1440px",
      "4xl": "1920px",
    },
    fontSize: {
      "3xs": ["var(--oui-font-size-3xs, 0.625rem)", "0.625rem"], // 10px
      "2xs": ["var(--oui-font-size-2xs, 0.75rem)", "1.125rem"], // 12px
      xs: ["var(--oui-font-size-xs, calc(0.875rem - 1px))", "1.25rem"], // 13px
      sm: ["var(--oui-font-size-sm,0.875rem)", "1.25rem"], // 14px
      base: ["var(--oui-font-size-base, 1rem)", "1.5rem"], // 16px
      lg: ["var(--oui-font-size-lg, 1.125rem)", "1.625rem"], // 18px
      xl: ["var(--oui-font-size-xl, 1.25rem)", "1.75rem"], // 20px
      "2xl": ["var(--oui-font-size-2xl, 1.5rem)", "2rem"], // 24px
      "3xl": ["var(--oui-font-size-3xl, 1.75rem)", "2.25rem"], // 28px
      "4xl": ["var(--oui-font-size-4xl, 1.875rem)", "2.375rem"], // 30px
      "5xl": ["var(--oui-font-size-5xl, 2.25rem)", "2.75rem"], // 36px
      "6xl": ["var(--oui-font-size-6xl, 3rem)", "3rem"], // 48px
    },
    // boxShadow: {
    //   sm: "var(--oui-shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))",
    //   DEFAULT:
    //     "var(--oui-shadow, 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1))",
    //   md: "var(--oui-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1))",
    //   lg: "var(--oui-shadow-lg, 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1))",
    //   xl: "var(--oui-shadow-xl, 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1))",
    //   "2xl": "var(--oui-shadow-2xl, 0 25px 50px -12px rgb(0 0 0 / 0.25))",
    // },
    extend: {
      spacing: {
        13: "3.25rem",
      },
      maxWidth: {
        xs: "var(--oui-spacing-xs, 20rem)",
        sm: "var(--oui-spacing-sm, 22.5rem)",
        md: "var(--oui-spacing-md, 26.25rem)",
        lg: "var(--oui-spacing-lg, 30rem)",
        xl: "var(--oui-spacing-xl, 33.75rem)",
      },
      colors: {
        primary: {
          DEFAULT: "rgb(var(--oui-color-primary) / <alpha-value>)",
          light: "rgb(var(--oui-color-primary-light) / <alpha-value>)",
          darken: "rgb(var(--oui-color-primary-darken) / <alpha-value>)",
          contrast: "rgb(var(--oui-color-primary-contrast) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--oui-color-secondary) / <alpha-value>)",
        },
        tertiary: {
          DEFAULT: "rgb(var(--oui-color-tertiary) / <alpha-value>)",
        },

        quaternary: {
          DEFAULT: "rgb(var(--oui-color-quaternary) / <alpha-value>)",
        },
        link: {
          DEFAULT: "rgb(var(--oui-color-link) / <alpha-value>)",
          light: "rgb(var(--oui-color-link-light) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--oui-color-danger) / <alpha-value>)",
          light: "rgb(var(--oui-color-danger-light) / <alpha-value>)",
          darken: "rgb(var(--oui-color-danger-darken) / <alpha-value>)",
          contrast: "rgb(var(--oui-color-danger-contrast) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--oui-color-warning) / <alpha-value>)",
          light: "rgb(var(--oui-color-warning-light) / <alpha-value>)",
          darken: "rgb(var(--oui-color-warning-darken) / <alpha-value>)",
          contrast: "rgb(var(--oui-color-warning-contrast) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--oui-color-success) / <alpha-value>)",
          light: "rgb(var(--oui-color-success-light) / <alpha-value>)",
          darken: "rgb(var(--oui-color-success-darken) / <alpha-value>)",
          contrast: "rgb(var(--oui-color-success-contrast) / <alpha-value>)",
        },
        base: {
          1: "rgb(var(--oui-color-base-1) / <alpha-value>)",
          2: "rgb(var(--oui-color-base-2) / <alpha-value>)",
          3: "rgb(var(--oui-color-base-3) / <alpha-value>)",
          4: "rgb(var(--oui-color-base-4) / <alpha-value>)",
          5: "rgb(var(--oui-color-base-5) / <alpha-value>)",
          6: "rgb(var(--oui-color-base-6) / <alpha-value>)",
          7: "rgb(var(--oui-color-base-7) / <alpha-value>)",
          8: "rgb(var(--oui-color-base-8) / <alpha-value>)",
          9: "rgb(var(--oui-color-base-9) / <alpha-value>)",
          10: "rgb(var(--oui-color-base-10) / <alpha-value>)",
          contrast: {
            // DEFAULT:"rgb(var(--oui-color-base-foreground) / <alpha-value>)",
            DEFAULT: "rgb(var(--oui-color-base-foreground) / 0.98)",
            80: "rgb(var(--oui-color-base-foreground) / 0.80)",
            54: "rgb(var(--oui-color-base-foreground) / 0.54)",
            36: "rgb(var(--oui-color-base-foreground) / 0.36)",
            20: "rgb(var(--oui-color-base-foreground) / 0.2)",
            12: "rgb(var(--oui-color-base-foreground) / 0.12)",
          },
        },
        line: {
          4: "rgb(var(--oui-color-line, 255 255 255) / 0.04)",
          6: "rgb(var(--oui-color-line, 255 255 255) / 0.06)",
          DEFAULT: "rgb(var(--oui-color-line, 255 255 255) / 0.08)",
          12: "rgb(var(--oui-color-line, 255 255 255) / 0.12)",
          16: "rgb(var(--oui-color-line, 255 255 255) / 0.16)",
        },
        trade: {
          loss: {
            DEFAULT: "rgb(var(--oui-color-trading-loss) / <alpha-value>)",
            contrast:
              "rgb(var(--oui-color-trading-loss-contrast) / <alpha-value>)",
          },

          profit: {
            DEFAULT: "rgb(var(--oui-color-trading-profit) / <alpha-value>)",
            contrast:
              "rgb(var(--oui-color-trading-profit-contrast) / <alpha-value>)",
          },
        },
        // gradient: {
        //   success: 'linear-gradient(var(--oui-linear-degree, 90deg), var(--oui-color-success) 0%, var(--oui-color-success-darken) 100%)',
        // }
      },
      animation: {
        "rotate-360": "rotate 1s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
      keyframes: {
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(240deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "collapsible-down": {
          from: { height: 0 },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: 0 },
        },
      },
    },
  },
  plugins: [
    themePlugin(),
    basePlugin(),
    sizePlugin(),
    chartPlugin(),
    gradientPlugin(),
    positionPlugin(),
    componentsPlugin(),
    scrollBarPlugin(),
    require("tailwindcss-animate"),
  ],
});
