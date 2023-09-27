/** @type {import('tailwindcss').Config} */

const plugin = require("tailwindcss/plugin");
const path = require("path");
import colors from "tailwindcss/colors";


module.exports = {
  mode: "jit",
  darkMode: ["class"],
  content: ["./src/**/*.{ts,js,tsx,jsx}"],
  // purge: ["./src/**/*.{ts,js,tsx,jsx}",
  // // "./node_modules/rc-slider/**/*.{ts,js,tsx,jsx}",
  // ],
  // content: ["./src/**/*.{ts,js,tsx,jsx}",path.join(path.dirname(require.resolve("rc-slider")).replace('lib/'), "**/*.{js,jsx}")],
  // prefix: 'orderly-',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "rgb(var(--orderly-color-background) / <alpha-value>)",
          contrast:
            "rgb(var(--orderly-color-background-contrast) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--orderly-color-primary) / <alpha-value>)",
          light: "rgb(var(--orderly-color-primary-light) / <alpha-value>)",
          // contrast:"rgb(var(--orderly-color-primary) / <alpha-value>)",
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

        neutral: {
          dark: "rgb(var(--orderly-color-neutral-dark) / <alpha-value>)",
          DEFAULT: "rgb(var(--orderly-color-neutral) / <alpha-value>)",
          light: "rgb(var(--orderly-color-neutral-light) / <alpha-value>)",
          contrast:
            "rgb(var(--orderly-color-neutral-contrast) / <alpha-value>)",
        },
        // 用于页面背景色，大块元素背景色
        base: {
          100: "rgb(var(--orderly-color-base-100) / <alpha-value>)",
          200: "rgb(var(--orderly-color-base-200) / <alpha-value>)",
          300: "rgb(var(--orderly-color-base-300) / <alpha-value>)",
          400: "rgb(var(--orderly-color-base-400) / <alpha-value>)",
          contrast: "rgb(var(--orderly-color-base-foreground) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--orderly-color-danger) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--orderly-color-warning) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--orderly-color-success) / <alpha-value>)",
        },
        // fill:{
        //   100: "rgb(var(--orderly-color-fill-100) / <alpha-value>)",
        // },
        // 用于input等填充色
        fill: {
          DEFAULT: "rgb(var(--orderly-color-fill) / <alpha-value>)",
          light: "rgb(var(--orderly-color-fill-light) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--orderly-color-popover) / <alpha-value>)",
          foreground:
            "rgb(var(--orderly-color-popover-foreground) / <alpha-value>)",
        },
        divider: "rgb(var(--orderly-color-divider) / <alpha-value>)",
        // disable:'',
        trade: {
          loss: "rgb(var(--orderly-color-trading-loss) / <alpha-value>)",
          "loss-foreground":
            "rgb(var(--orderly-color-trading-loss-contrast) / <alpha-value>)",
          profit: "rgb(var(--orderly-color-trading-profit) / <alpha-value>)",
          "profit-foreground":
            "rgb(var(--orderly-color-trading-profit-contrast) / <alpha-value>)",
        },
      },
      borderRadius: {
        DEFAULT: "var(--orderly-rounded)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
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
        html: { fontSize: "14px", backgroundColor: "rgb(var(--orderly-color-base-100))",color:"rgb(var(--orderly-color-base-foreground) / 0.9)" },
        body: { fontSize: "14px", backgroundColor: "rgb(var(--orderly-color-base-100))",color:"rgb(var(--orderly-color-base-foreground) / 0.9)" },
      });
    }),
  ],
};
