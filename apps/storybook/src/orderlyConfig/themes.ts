import {
  LIGHT_THEME_CSS_VARS,
  PURPLE_DARK_THEME_CSS_VARS,
  type ThemeConfig,
} from "@orderly.network/ui";
import {
  BLUE_DARK_THEME_CSS_VARS,
  CYAN_DARK_THEME_CSS_VARS,
  MINT_DARK_THEME_CSS_VARS,
  SQUARE_DARK_THEME_CSS_VARS,
  TEAL_DARK_THEME_CSS_VARS,
} from "../theme";

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
    id: "square-dark",
    displayName: "Dark (Square)",
    mode: "dark",
    cssVars: SQUARE_DARK_THEME_CSS_VARS,
  },
  {
    id: "purple-dark",
    displayName: "Dark (Purple)",
    mode: "dark",
    cssVars: PURPLE_DARK_THEME_CSS_VARS,
  },
  {
    id: "blue-dark",
    displayName: "Dark (Blue)",
    mode: "dark",
    cssVars: BLUE_DARK_THEME_CSS_VARS,
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
    id: "mint-dark",
    displayName: "Dark (Mint)",
    mode: "dark",
    cssVars: MINT_DARK_THEME_CSS_VARS,
    tradingViewColorConfig: {
      upColor: "#0FB276",
      downColor: "#F5464B",
      pnlUpColor: "#0FB276",
      pnlDownColor: "#F5464B",
    },
  },
  {
    id: "cyan-dark",
    displayName: "Dark (Cyan)",
    mode: "dark",
    cssVars: CYAN_DARK_THEME_CSS_VARS,
  },
  {
    id: "teal-dark",
    displayName: "Dark (Teal)",
    mode: "dark",
    cssVars: TEAL_DARK_THEME_CSS_VARS,
  },
];
