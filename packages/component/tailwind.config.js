/** @type {import('tailwindcss').Config} */

const plugin = require("tailwindcss/plugin");

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
        },
        trade: {
          loss: "rgb(var(--orderly-color-trading-loss) / <alpha-value>)",
          "loss-foreground":
            "rgb(var(--orderly-color-trading-loss-contrast) / <alpha-value>)",
          profit: "rgb(var(--orderly-color-trading-profit) / <alpha-value>)",
          "profit-foreground":
            "rgb(var(--orderly-color-trading-profit-contrast) / <alpha-value>)",
        },

        brand: {
          100: "#535E7B",
        },
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      fontSize: {
        headertitle: "20px",
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
