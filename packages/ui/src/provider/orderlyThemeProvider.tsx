import {
  ComponentType,
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
} from "react";
import { ExtensionPosition } from "../plugin";
import { ComponentsProvider } from "./componentProvider";
import {
  ComponentOverrides,
  OrderlyThemeContext,
  OrderlyThemeContextState,
  ThemeConfig,
} from "./orderlyThemeContext";

export type OrderlyThemeProviderProps = {
  // dateFormatting?: string;
  components?: {
    [position in ExtensionPosition]: ComponentType;
  };
  overrides?: Partial<ComponentOverrides>;
  themes?: ThemeConfig[];
  currentThemeId?: string;
  currentTheme?: ThemeConfig;
  setCurrentThemeId?: (id: string) => void;
};

export const OrderlyThemeProvider: FC<
  PropsWithChildren<OrderlyThemeProviderProps>
> = (props) => {
  const {
    components,
    overrides,
    themes,
    currentThemeId,
    currentTheme,
    setCurrentThemeId,
    children,
  } = props;

  const resolveComponentTheme = useCallback(
    <T extends keyof ComponentOverrides>(
      component: T,
      defaultValue?: ComponentOverrides[T],
    ) => {
      return (overrides as ComponentOverrides)?.[component] || defaultValue;
    },
    [overrides],
  );

  const memoizedValue = useMemo<OrderlyThemeContextState>(() => {
    return {
      getComponentTheme: resolveComponentTheme,
      themes: themes ?? [],
      currentThemeId,
      currentTheme,
      setCurrentThemeId,
    };
  }, [
    resolveComponentTheme,
    themes,
    currentThemeId,
    currentTheme,
    setCurrentThemeId,
  ]);

  return (
    <OrderlyThemeContext.Provider value={memoizedValue}>
      <ComponentsProvider components={components}>
        {children}
      </ComponentsProvider>
    </OrderlyThemeContext.Provider>
  );
};
