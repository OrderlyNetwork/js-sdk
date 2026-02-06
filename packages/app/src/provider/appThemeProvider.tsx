import { FC, PropsWithChildren, useEffect } from "react";
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

  // Apply theme to DOM via data-oui-theme and optional cssVars.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;

    if (!currentThemeId) {
      root.removeAttribute("data-oui-theme");
      return;
    }

    root.setAttribute("data-oui-theme", currentThemeId);

    const themeConfig = themes?.find((theme) => theme.id === currentThemeId);

    if (themeConfig?.cssVars) {
      Object.entries(themeConfig.cssVars).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [themes, currentThemeId]);

  return (
    <OrderlyThemeProvider
      themes={themes}
      currentThemeId={currentThemeId}
      setCurrentThemeId={setCurrentThemeId}
      {...rest}
    >
      {children}
    </OrderlyThemeProvider>
  );
};
