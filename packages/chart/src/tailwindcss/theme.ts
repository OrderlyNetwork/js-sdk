import plugin from "tailwindcss/plugin";

export const chartPlugin = () =>
  plugin(function ({ addComponents, addBase }) {
    addComponents(
      {
        ".xAxis": {
          ".recharts-cartesian-axis-tick:first-child text": {
            "text-anchor": "start",
          },
          ".recharts-cartesian-axis-tick:last-child text": {
            "text-anchor": "end",
          },
        },
      },
      {
        respectPrefix: false,
      }
    );
  });
