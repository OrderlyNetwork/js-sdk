import { FC, PropsWithChildren, useEffect, useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import {
  OrderlyThemeProvider,
  type OrderlyThemeProviderProps,
  DARK_THEME_CSS_VARS,
  type ThemeCssVars,
} from "@orderly.network/ui";

export type AppThemeProviderProps =
  PropsWithChildren<OrderlyThemeProviderProps>;

export const ORDERLY_THEME_STORAGE_KEY = "orderly_theme_id";

export const AppThemeProvider: FC<AppThemeProviderProps> = (props) => {
  const { children, themes, ...rest } = props;

  const [currentThemeId, setCurrentThemeId] = useLocalStorage<
    string | undefined
  >(ORDERLY_THEME_STORAGE_KEY, themes?.[0]?.id);

  const currentTheme = useMemo(() => {
    return themes?.find((theme) => theme.id === currentThemeId);
  }, [themes, currentThemeId]);

  // Apply theme to DOM via data-oui-theme and optional cssVars.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (!currentThemeId) {
      root.removeAttribute("data-oui-theme");
      return;
    }

    root.setAttribute("data-oui-theme", currentThemeId);

    // override default theme css vars with current theme css vars
    Object.entries(DARK_THEME_CSS_VARS).forEach(([key, value]) => {
      const newValue =
        currentTheme?.cssVars?.[key as keyof ThemeCssVars] || value;
      root.style.setProperty(key, newValue);
    });
  }, [currentThemeId, currentTheme]);

  return (
    <OrderlyThemeProvider
      themes={themes}
      currentThemeId={currentThemeId}
      currentTheme={currentTheme}
      setCurrentThemeId={setCurrentThemeId}
      {...rest}
    >
      {children}
    </OrderlyThemeProvider>
  );
};
