import { createContext, useContext } from "react";

export type ComponentOverrides = {
  tabs: {
    variant: "text" | "contained";
  };
  chainSelector: {
    /**
     * show testnet chains list
     * @default true
     * */
    showTestnet: boolean;
  };
};

export type ThemeConfig = {
  /**
   * Unique theme identifier.
   * Will also be used as the value of `data-oui-theme`.
   */
  id: string;
  /**
   * Display name for this theme. Used in UI (e.g. settings page).
   */
  displayName: string;
  /**
   * Optional CSS variables overrides for this theme.
   * Keys should be full CSS variable names, e.g. "--oui-color-primary".
   * These are applied at runtime via document.documentElement.style.setProperty.
   */
  cssVars?: Record<string, string>;
};

type GetComponentTheme = <T extends keyof ComponentOverrides>(
  component: T,
  defaultValue?: ComponentOverrides[T],
) => ComponentOverrides[T];

export type OrderlyThemeContextState = {
  // overrides?: Partial<ComponentOverrides>;
  getComponentTheme: GetComponentTheme;
  themes: ThemeConfig[];
  currentThemeId?: string;
  setCurrentThemeId?: (id: string) => void;
};

export const OrderlyThemeContext = createContext(
  {} as OrderlyThemeContextState,
);

export const useOrderlyTheme = () => {
  return useContext(OrderlyThemeContext);
};
