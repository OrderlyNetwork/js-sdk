/** @type {import('tailwindcss').Config} */

const plugin = require("tailwindcss/plugin");
const path = require("path");
const defaultTheme = require("tailwindcss/defaultTheme");

import colors from "tailwindcss/colors";

module.exports = {
  mode: "jit",
  darkMode: ["class"],
  content: ["./src/**/*.{ts,js,tsx,jsx}"],
  // purge: ["./src/**/*.{ts,js,tsx,jsx}",
  // // "./node_modules/rc-slider/**/*.{ts,js,tsx,jsx}",
  // ],
  // content: ["./src/**/*.{ts,js,tsx,jsx}",path.join(path.dirname(require.resolve("rc-slider")).replace('lib/'), "**/*.{js,jsx}")],
  prefix: "orderly-",
  theme: {
    screens: {
      desktop: "1024px",
    },
    fontSize: {
      "4xs":
        "var(--orderly-font-size-4xs, calc(var(--orderly-font-size-base) - 5px))", // if base is 16px, it will be 11px
      "3xs":
        "var(--orderly-font-size-3xs, calc(var(--orderly-font-size-base) - 4px))", // if base is 16px, it will be 12px
      "2xs":
        "var(--orderly-font-size-2xs, calc(var(--orderly-font-size-base) - 3px))", // if base is 16px, it will be 13px
      xs: "var(--orderly-font-size-xs, calc(var(--orderly-font-size-base) - 2px))", // if base is 16px, it will be 14px
      sm: "var(--orderly-font-size-sm, calc(var(--orderly-font-size-base) - 1px))", // if base is 16px, it will be 15px
      base: "var(--orderly-font-size-base)", // if base is 16px, it will be 16px
      lg: "var(--orderly-font-size-lg, calc(var(--orderly-font-size-base) + 2px))", // if base is 16px, it will be 18px
      xl: "var(--orderly-font-size-xl, calc(var(--orderly-font-size-base) + 4px))", // if base is 16px, it will be 20px
      "2xl":
        "var(--orderly-font-size-2xl, calc(var(--orderly-font-size-base) + 8px))", // if base is 16px, it will be 24px
      "3xl":
        "var(--orderly-font-size-3xl, calc(var(--orderly-font-size-base) + 14px))", // if base is 16px, it will be 30px
      "4xl":
        "var(--orderly-font-size-4xl, calc(var(--orderly-font-size-base) + 20px))", // if base is 16px, it will be 36px
    },
    boxShadow: {
      'sm': "var(--orderly-shadow-sm, 0px 12px 20px 0px rgba(0, 0, 0, 0.3))",
      DEFAULT: "var(--orderly-shadow, 0px 12px 20px 0px rgba(0, 0, 0, 0.3))",
      'md': "var(--orderly-shadow-md, 0px 12px 20px 0px rgba(0, 0, 0, 0.3))",
      'lg': "var(--orderly-shadow-lg, 0px 12px 20px 0px rgba(0, 0, 0, 0.3))",
      'xl': "var(--orderly-shadow-xl, 0px 12px 20px 0px rgba(0, 0, 0, 0.3))",
      '2xl': "var(--orderly-shadow-2xl, 0px 12px 20px 0px rgba(0, 0, 0, 0.3))",
    },
    extend: {
      fontFamily: {
        manrope: [
          "var(--orderly-font-family)",
          "sans-serif",
          ...defaultTheme.fontFamily.mono,
        ],
      },
      colors: {
        primary: {
          DEFAULT: "rgb(var(--orderly-color-primary) / <alpha-value>)",
          light: "rgb(var(--orderly-color-primary-light) / <alpha-value>)",
          darken: "rgb(var(--orderly-color-primary-darken) / <alpha-value>)",
          contrast:
            "rgb(var(--orderly-color-primary-contrast) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--orderly-color-secondary) / <alpha-value>)",
        },
        tertiary: {
          DEFAULT: "rgb(var(--orderly-color-tertiary) / <alpha-value>)",
        },
        quaternary: {
          DEFAULT: "rgb(var(--orderly-color-quaternary) / <alpha-value>)",
        },
        link: {
          DEFAULT: "rgb(var(--orderly-color-link) / <alpha-value>)",
          light: "rgb(var(--orderly-color-link-light) / <alpha-value>)",
        },

        // 用于页面背景色，大块元素背景色
        base: {
          100: "rgb(var(--orderly-color-base-100) / <alpha-value>)",
          200: "rgb(var(--orderly-color-base-200) / <alpha-value>)",
          300: "rgb(var(--orderly-color-base-300) / <alpha-value>)",
          400: "rgb(var(--orderly-color-base-400) / <alpha-value>)",
          500: "rgb(var(--orderly-color-base-500) / <alpha-value>)",
          600: "rgb(var(--orderly-color-base-600) / <alpha-value>)",
          700: "rgb(var(--orderly-color-base-700) / <alpha-value>)",
          800: "rgb(var(--orderly-color-base-800) / <alpha-value>)",
          900: "rgb(var(--orderly-color-base-900) / <alpha-value>)",
          contrast: {
            // DEFAULT:"rgb(var(--orderly-color-base-foreground) / <alpha-value>)",
            DEFAULT: "rgb(var(--orderly-color-base-foreground) / 0.98)",
            80: "rgb(var(--orderly-color-base-foreground) / 0.80)",
            54: "rgb(var(--orderly-color-base-foreground) / 0.54)",
            36: "rgb(var(--orderly-color-base-foreground) / 0.36)",
            20: "rgb(var(--orderly-color-base-foreground) / 0.2)",
            12: "rgb(var(--orderly-color-base-foreground) / 0.12)",
          },
        },

        danger: {
          DEFAULT: "rgb(var(--orderly-color-danger) / <alpha-value>)",
          light: "rgb(var(--orderly-color-danger-light) / <alpha-value>)",
          darken: "rgb(var(--orderly-color-danger-darken) / <alpha-value>)",
          contrast: "rgb(var(--orderly-color-danger-contrast) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--orderly-color-warning) / <alpha-value>)",
          light: "rgb(var(--orderly-color-warning-light) / <alpha-value>)",
          darken: "rgb(var(--orderly-color-warning-darken) / <alpha-value>)",
          contrast:
            "rgb(var(--orderly-color-warning-contrast) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--orderly-color-success) / <alpha-value>)",
          light: "rgb(var(--orderly-color-success-light) / <alpha-value>)",
          darken: "rgb(var(--orderly-color-success-darken) / <alpha-value>)",
          contrast:
            "rgb(var(--orderly-color-success-contrast) / <alpha-value>)",
        },
        // fill:{
        //   100: "rgb(var(--orderly-color-fill-100) / <alpha-value>)",
        // },
        // 用于input等填充色
        fill: {
          DEFAULT: "rgb(var(--orderly-color-fill) / <alpha-value>)",
          light: "rgb(var(--orderly-color-fill-light) / <alpha-value>)",
        },
        divider: "rgb(var(--orderly-color-divider) / <alpha-value>)",
        // disable:'',
        trade: {
          loss: {
            DEFAULT: "rgb(var(--orderly-color-trading-loss) / <alpha-value>)",
            contrast:
              "rgb(var(--orderly-color-trading-loss-contrast) / <alpha-value>)",
          },

          profit: {
            DEFAULT: "rgb(var(--orderly-color-trading-profit) / <alpha-value>)",
            contrast:
              "rgb(var(--orderly-color-trading-profit-contrast) / <alpha-value>)",
          },
        },
      },
      borderRadius: {
        DEFAULT: "var(--orderly-rounded)",
        lg: "var(--orderly-rounded-lg)",
        full: "var(--orderly-rounded-full)",
        sm: "var(--orderly-rounded-sm)",
      },
      fontSize: {
        headertitle: "20px",
      },
      boxShadow: {
        button: "var(--orderly-button-shadow)",
      },
      keyframes: {
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
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "collapsible-down": "collapsible-down 0.2s ease-out",
        "collapsible-up": "collapsible-up 0.2s ease-out",
      },
      // linearBorderGradients: ({theme})=>({
      //   colors:{
      //     'primary': [theme('colors.primary'), theme('colors.secondary')],
      //   }
      // })
    },

    // colors:{
    //   primary: '#FF6363',
    // }
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    plugin(function ({ addBase }) {
      addBase({
        html: {
          fontSize: "var(--orderly-font-size-base)",
          backgroundColor: "rgb(var(--orderly-color-base-900))",
          color: "rgb(var(--orderly-color-base-foreground) / 0.98)",
          fontFamily: "var(--orderly-font-family)",
        },
        body: {
          fontSize: "var(--orderly-font-size-base)",
          backgroundColor: "rgb(var(--orderly-color-base-900))",
          color: "rgb(var(--orderly-color-base-foreground) / 0.98)",
          fontFamily: "var(--orderly-font-family)",
        },
        // ':root':{}
      });
    }),
    plugin(function ({ addUtilities }) {
      const scrollBarUtilities = {
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
        ".hide-scrollbar::-webkit-scrollbar-thumb": {
          display: "none",
        },
      };

      addUtilities(scrollBarUtilities);
    }),
    plugin(function ({ addUtilities }) {
      const scrollBarUtilities = {
        ".component-scrollbar::-webkit-scrollbar": {
          width: "4px",
        },
        ".component-scrollbar::-webkit-scrollbar-thumb": {
          borderRadius: "2px",
          borderStyle: "dashed",
          borderColor: "transparent",
          borderWidth: "1px",
          background: "rgba(255,255,255,0.04)",
          backgroundClip: "padding-box",
        },
        ".component-scrollbar::-webkit-scrollbar-thumb:hover": {
          background: "rgba(255,255,255,0.08)",
          borderRadius: "3px",
        },
      };
      addUtilities(scrollBarUtilities);
    }),
    plugin(function ({ addUtilities }) {
      const scrollBarUtilities = {
        ".desktop-scrollbar::-webkit-scrollbar": {
          width: "6px",
        },
        ".desktop-scrollbar::-webkit-scrollbar-thumb": {
          borderRadius: "3px",
          borderStyle: "dashed",
          borderColor: "transparent",
          borderWidth: "1px",
          background: "rgba(255,255,255,0.04)",
          backgroundClip: "padding-box",
        },
        ".desktop-scrollbar::-webkit-scrollbar-thumb:hover": {
          background: "rgba(255,255,255,0.08)",
          borderRadius: "4px",
        },
      };
      addUtilities(scrollBarUtilities);
    }),
  ],
};
