import { useEffect } from "react";

const themes = {
  orderly: "orderly",
  custom: "custom",
  roundless: "roundless",
};

/** set custom theme */
export function useTheme() {
  useEffect(() => {
    const parentElement = document.querySelector("html");
    const envTheme = import.meta.env.VITE_DEFAULT_THEME as keyof typeof themes;
    const themeKey = envTheme || themes.orderly;

    if (parentElement) {
      parentElement.setAttribute("data-oui-theme", themes[themeKey]);
    }
  }, []);
}
