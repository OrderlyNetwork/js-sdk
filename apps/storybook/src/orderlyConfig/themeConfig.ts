import { ThemeConfig } from "@orderly.network/ui";

export const themeConfig: ThemeConfig[] = [
  {
    id: "orderly",
    displayName: "Dark",
    mode: "dark",
    cssVars: {},
  },
  {
    id: "light",
    displayName: "Light",
    mode: "light",
    cssVars: {},
  },

  {
    id: "custom",
    displayName: "Custom",
    mode: "dark",
    cssVars: {},
  },
  {
    id: "roundless",
    displayName: "Roundless",
    mode: "dark",
    cssVars: {
      "--oui-color-primary": "#000000",
    },
  },
];
