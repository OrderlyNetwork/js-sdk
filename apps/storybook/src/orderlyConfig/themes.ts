import { ThemeConfig, LIGHT_THEME_CSS_VARS } from "@orderly.network/ui";
import { CUSTOM_THEME_CSS_VARS, ROUNDLESS_THEME_CSS_VARS } from "../theme";

export const themes: ThemeConfig[] = [
  {
    id: "orderly",
    displayName: "Dark",
    mode: "dark",
  },
  {
    id: "light",
    displayName: "Light",
    mode: "light",
    cssVars: LIGHT_THEME_CSS_VARS,
  },
  {
    id: "custom",
    displayName: "Custom",
    mode: "dark",
    cssVars: CUSTOM_THEME_CSS_VARS,
  },
  {
    id: "roundless",
    displayName: "Roundless",
    mode: "dark",
    cssVars: ROUNDLESS_THEME_CSS_VARS,
  },
];
