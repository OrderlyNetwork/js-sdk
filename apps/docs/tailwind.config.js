/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
          darken: "rgb(var(--orderly-color-primary-darken) / <alpha-value>)",
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
        link: {
          DEFAULT: "rgb(var(--orderly-color-link) / <alpha-value>)",
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
          },
        },

        danger: {
          DEFAULT: "rgb(var(--orderly-color-danger) / <alpha-value>)",
          light: "rgb(var(--orderly-color-danger-light) / <alpha-value>)",
          darken: "rgb(var(--orderly-color-danger-darken) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--orderly-color-warning) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--orderly-color-success) / <alpha-value>)",
          light: "rgb(var(--orderly-color-success-light) / <alpha-value>)",
          darken: "rgb(var(--orderly-color-success-darken) / <alpha-value>)",
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

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        slideDown: {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        slideUp: {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        slideDown: 'slideDown 300ms cubic-bezier(0.87, 0, 0.13, 1)',
        slideUp: 'slideUp 300ms cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },
  // corePlugins:{
  //   preflight: false,
  // },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        html: { fontSize: "14px" },
      });
    }),
  ],
};
