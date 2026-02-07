import { FC, PropsWithChildren, useEffect, useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import {
  OrderlyThemeProvider,
  type OrderlyThemeProviderProps,
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

    if (currentTheme?.cssVars) {
      Object.entries(currentTheme.cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [themes, currentThemeId, currentTheme]);

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
