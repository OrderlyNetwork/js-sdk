import { LIGHT_THEME_CSS_VARS, type ThemeConfig } from "@orderly.network/ui";
import { CUSTOM_THEME_CSS_VARS, ROUNDLESS_THEME_CSS_VARS } from "../theme";

export const themes: ThemeConfig[] = [
  {
    id: "orderly",
    displayName: "Dark",
    mode: "dark",
    isDefault: true,
  },
  {
    id: "light",
    displayName: "Light",
    mode: "light",
    cssVars: LIGHT_THEME_CSS_VARS,
    // tradingViewColorConfig: {
    //   chartBG: "#FFFFFF",
    //   upColor: "#0ECB81",
    //   downColor: "#F6465D",
    //   pnlUpColor: "#0ECB81",
    //   pnlDownColor: "#F6465D",
    //   textColor: "#000000",
    //   qtyTextColor: "#000000",
    //   volumeUpColor: "#0ECB81",
    //   volumeDownColor: "#F6465D",
    //   closeIconColor: "rgba(0, 0, 0, 0.8)",
    // },
  },
  {
    id: "custom",
    displayName: "Custom",
    mode: "dark",
    cssVars: CUSTOM_THEME_CSS_VARS,
    // tradingViewColorConfig: {
    //   chartBG: "#131519",
    //   upColor: "#00B49E",
    //   downColor: "#FF447C",
    //   pnlUpColor: "#00B49E",
    //   pnlDownColor: "#FF447C",
    //   textColor: "#FFFFFF",
    //   qtyTextColor: "#F4F7F9",
    //   volumeUpColor: "#0C3E3A",
    //   volumeDownColor: "#5A1E36",
    //   closeIconColor: "rgba(255, 255, 255, 0.8)",
    // },
  },
  {
    id: "roundless",
    displayName: "Roundless",
    mode: "dark",
    cssVars: ROUNDLESS_THEME_CSS_VARS,
  },
];
