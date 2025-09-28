import { useEffect } from "react";
import { useEnvFormUrl } from "./useEnvFormUrl";

const themes = {
  orderly: "orderly",
  custom: "custom",
  roundless: "roundless",
  light: "light",
};

/** set custom theme */
export function useTheme() {
  const { theme } = useEnvFormUrl();

  useEffect(() => {
    const parentElement = document.querySelector("html");
    const envTheme = import.meta.env.VITE_DEFAULT_THEME as keyof typeof themes;
    const urlTheme = theme as keyof typeof themes;
    const themeKey = urlTheme || envTheme || themes.orderly;

    if (parentElement) {
      parentElement.setAttribute("data-oui-theme", themes[themeKey]);
    }
  }, [theme]);
}
