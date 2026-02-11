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
  // cssVars 通过 [data-oui-theme="xxx"] 选择器注入，而非直接设置在根元素上
  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const STYLE_ID = "oui-theme-css-vars";

    if (!currentThemeId) {
      root.removeAttribute("data-oui-theme");
      document.getElementById(STYLE_ID)?.remove();
      return;
    }

    root.setAttribute("data-oui-theme", currentThemeId);

    if (currentTheme?.cssVars && Object.keys(currentTheme.cssVars).length > 0) {
      let styleEl = document.getElementById(
        STYLE_ID,
      ) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = STYLE_ID;
        document.head.appendChild(styleEl);
      }
      const varsContent = Object.entries(currentTheme.cssVars)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join("\n");
      styleEl.textContent = `[data-oui-theme="${currentThemeId}"] {\n${varsContent}\n}`;
    } else {
      document.getElementById(STYLE_ID)?.remove();
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
