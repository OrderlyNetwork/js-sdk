/** @type {import('tailwindcss').Config} */

const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,js,tsx,jsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "rgb(var(--orderly-color-background) / <alpha-value>)",
          contrast: "rgb(var(--orderly-color-background-contrast) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--orderly-color-primary) / <alpha-value>)",
        },
        brand: {
          100: "#535E7B",
        },
      },
      borderRadius: {
        DEFAULT: "6px",
      },
    },
    // colors:{
    //   primary: '#FF6363',
    // }
  },
  plugins: [
    require("@tailwindcss/typography"),
    plugin(function ({ addBase }) {
      addBase({
        html: { fontSize: "13px" },
      });
    }),
  ],
};
