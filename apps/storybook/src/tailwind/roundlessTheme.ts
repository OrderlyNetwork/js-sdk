import plugin from "tailwindcss/plugin";

export const roundlessThemePlugin = () =>
  plugin(function ({ addBase }) {
    addBase({
      '[data-oui-theme="roundless"]': {
        /* rounded */
        "--oui-rounded-sm": "0",
        "--oui-rounded": "0",
        "--oui-rounded-md": "0",
        "--oui-rounded-lg": "0",
        "--oui-rounded-xl": " 0",
        "--oui-rounded-2xl": "0",
        "--oui-rounded-3xl": "0",
        "--oui-rounded-full": "0",
      },
    });
  });
