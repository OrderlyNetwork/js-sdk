import plugin from "tailwindcss/plugin";

export const chartPlugin = () =>
  plugin(function ({ addComponents }) {
    addComponents({
      ".position": {},
    });
  });
