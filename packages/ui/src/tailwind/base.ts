import plugin from "tailwindcss/plugin";

export const basePlugin = () =>
  plugin(function ({ addComponents, addBase }) {
    addBase({
      html: {
        // fontSize: "var(--orderly-font-size-base)",
        backgroundColor: "rgb(var(--orderly-color-base-9))",
        color: "rgb(var(--orderly-color-base-foreground) / 0.98)",
        fontFamily: "var(--orderly-font-family)",
      },
      body: {
        // fontSize: "var(--orderly-font-size-base)",
        backgroundColor: "rgb(var(--orderly-color-base-9))",
        color: "rgb(var(--orderly-color-base-foreground) / 0.98)",
        fontFamily: "var(--orderly-font-family)",
      },
    });
  });
