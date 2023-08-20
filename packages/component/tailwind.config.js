/** @type {import('tailwindcss').Config} */

const plugin = require("tailwindcss/plugin");
import colors from "tailwindcss/colors";

module.exports = {
  mode: "jit",
  darkMode: ["class"],
  // content: ["./src/**/*.{ts,js,tsx,jsx}"],
  purge: ["./src/**/*.{ts,js,tsx,jsx}"],
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
          contrast: "rgb(var(--orderly-color-base-contract) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--orderly-color-danger) / <alpha-value>)",
        },
        success:{
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
        popover:{
          DEFAULT:'rgb(var(--orderly-color-popover) / <alpha-value>)',
          foreground:'rgb(var(--orderly-color-popover-foreground) / <alpha-value>)',
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
    linearBorderGradients: {
      directions: {
        // defaults to these values
        t: "to top",
        tr: "to top right",
        r: "to right",
        br: "to bottom right",
        b: "to bottom",
        bl: "to bottom left",
        l: "to left",
        tl: "to top left",
      },
      colors: {
        // defaults to {}
        red: "#f00",
        "red-blue": ["#f00", "#00f"],
        "blue-green": ["#0000ff", "#00FF00"],
        "red-green-blue": ["#f00", "#0f0", "#00f"],
        "black-white-with-stops": ["#000", "#000 45%", "#fff 55%", "#fff"],
      },
      background: {
        "gray-50": "#F9FAFB",
        "gray-900": "#111827",
      },
      borders: {
        // defaults to these values (optional)
        1: "1px",
        2: "2px",
        4: "4px",
      },
    },
    // colors:{
    //   primary: '#FF6363',
    // }
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss-animate"),
    require("tailwindcss-border-gradient-radius"),
    plugin(function ({ addBase }) {
      addBase({
        html: { fontSize: "14px" },
      });
    }),
  ],
};
