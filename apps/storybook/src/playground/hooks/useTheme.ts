import { useEffect } from "react";
import { useSearchParams } from "react-router";

const themes = {
  orderly: "orderly",
  custom: "custom",
  roundless: "roundless",
};

/** set custom theme */
export function useTheme() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const parentElement = document.querySelector("html");
    const envTheme = import.meta.env.VITE_DEFAULT_THEME as keyof typeof themes;
    const urlTheme = searchParams.get("theme") as keyof typeof themes;
    const themeKey = urlTheme || envTheme || themes.orderly;

    if (parentElement) {
      parentElement.setAttribute("data-oui-theme", themes[themeKey]);
    }
  }, [searchParams]);
}
