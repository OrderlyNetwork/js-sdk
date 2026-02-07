import { useEffect } from "react";
import { useEnvFormUrl } from "./useEnvFormUrl";

const themes = {
  orderly: "orderly",
  custom: "custom",
  roundless: "roundless",
  lightPrimary: "lightPrimary",
  light: "light",
};

/** set custom theme */
export function useTheme() {
  const { theme } = useEnvFormUrl();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const envTheme = import.meta.env.VITE_DEFAULT_THEME as keyof typeof themes;
    const urlTheme = theme as keyof typeof themes;
    const themeKey = urlTheme || envTheme || themes.orderly;

    if (root) {
      root.setAttribute("data-oui-theme", themes[themeKey]);
    }
  }, [theme]);
}
