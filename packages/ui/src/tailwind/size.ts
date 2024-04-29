import plugin from "tailwindcss/plugin";

export const sizePlugin = () =>
  plugin(function ({ addComponents }) {
    addComponents({
      ".size": {
        height: "var(--oui-height, auto)",
        width: "var(--oui-width, auto)",
      },
    });
  });
