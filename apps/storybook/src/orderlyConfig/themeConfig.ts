import { ThemeConfig } from "@orderly.network/ui";
import {
  customThemeCssVars,
  lightThemeCssVars,
  roundlessThemeCssVars,
} from "../tailwind";

export const themeConfig: ThemeConfig[] = [
  {
    id: "orderly",
    displayName: "Dark",
    mode: "dark",
  },
  {
    id: "light",
    displayName: "Light",
    mode: "light",
    cssVars: lightThemeCssVars,
  },
  {
    id: "custom",
    displayName: "Custom",
    mode: "dark",
    cssVars: customThemeCssVars,
  },
  {
    id: "roundless",
    displayName: "Roundless",
    mode: "dark",
    cssVars: roundlessThemeCssVars,
  },
];
