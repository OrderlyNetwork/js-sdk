const { withTV } = require('tailwind-variants/transformer');

const {sizePlugin} = require('./src/tailwind/size')

/** @type {import('tailwindcss').Config} */
module.exports = withTV({
  mode: "jit",
  darkMode: ["class"],
  content: ["./src/**/*.{ts,js,tsx,jsx}"],
  prefix: "oui-",

  theme: {
    fontSize: {
      "3xs":
        ["var(--oui-font-size-3xs, 0.625rem)",'0.625rem'], // 10px
      "2xs":
        ["var(--oui-font-size-2xs, 0.75rem)",'1.125rem'], // 12px
      xs: ["var(--oui-font-size-xs, calc(0.875rem - 3px))",'1.25rem'], // 13px
      sm: ["var(--oui-font-size-sm, 	0.875rem)",'1.25rem'], // 14px
      base: ["var(--oui-font-size-base, 1rem)",'1.5rem'], // 16px
      lg: ["var(--oui-font-size-lg, 1.125rem)",'1.625rem'], // 18px
      xl: ["var(--oui-font-size-xl, 1.25rem)",'1.75rem'], // 20px
      "2xl":
        ["var(--oui-font-size-2xl, 1.5rem)",'2rem'], // 24px
      "3xl":
        ["var(--oui-font-size-3xl, 1.75rem)",'2.25rem'], // 28px
      "4xl":
        ["var(--oui-font-size-4xl, 1.875rem)",'2.375rem'], // 30px
      "5xl":
        ["var(--oui-font-size-5xl, 2.25rem)",'2.75rem'], // 36px
      "6xl":
        ["var(--oui-font-size-6xl, 3rem)",'3rem'], // 48px
    },
    lineHeight:{
      '3xs': '0.625rem',
    },
    extend: {
      spacing:{
        '13': '3.25rem',
      }
    },
    colors:{
      primary: {
        DEFAULT: "rgb(var(--oui-color-primary) / <alpha-value>)",
        // light: "rgb(var(--oui-color-primary-light) / <alpha-value>)",
        // darken: "rgb(var(--oui-color-primary-darken) / <alpha-value>)",
        contrast:
          "rgb(var(--oui-color-primary-contrast) / <alpha-value>)",
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
        contrast:
          "rgb(var(--oui-color-warning-contrast) / <alpha-value>)",
      },
      success: {
        DEFAULT: "rgb(var(--oui-color-success) / <alpha-value>)",
        light: "rgb(var(--oui-color-success-light) / <alpha-value>)",
        darken: "rgb(var(--oui-color-success-darken) / <alpha-value>)",
        contrast:
          "rgb(var(--oui-color-success-contrast) / <alpha-value>)",
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
    }
  },
  plugins: [sizePlugin(),require("tailwindcss-animate"),],
});
