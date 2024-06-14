import plugin from "tailwindcss/plugin";

export const basePlugin = () =>
  plugin(function ({ addComponents, addBase }) {
    addBase({
      html: {
        // fontSize: "var(--orderly-font-size-base)",
        backgroundColor: "rgb(var(--oui-color-base-10))",
        color: "rgb(var(--oui-color-base-foreground) / 0.98)",
        fontFamily: "var(--oui-font-family)",
      },
      body: {
        // fontSize: "var(--oui-font-size-base)",
        backgroundColor: "rgb(var(--oui-color-base-10))",
        color: "rgb(var(--oui-color-base-foreground) / 0.98)",
        fontFamily: "var(--oui-font-family)",
      },
    });
  });
