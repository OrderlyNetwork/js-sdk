import React, {
  ComponentType,
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { ExtensionPosition } from "../plugin";
import { ComponentsProvider } from "./componentProvider";

type ComponentOverrides = {
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
  /** @hidden */
  announcement: {
    dataAdapter: (data: any[]) => any[];
  };
};

type GetComponentTheme = <T extends keyof ComponentOverrides>(
  component: T,
  defaultValue?: ComponentOverrides[T],
) => ComponentOverrides[T];

export type OrderlyThemeContextState = {
  // overrides?: Partial<ComponentOverrides>;
  getComponentTheme: GetComponentTheme;
};

const OrderlyThemeContext = createContext<OrderlyThemeContextState>(
  {} as OrderlyThemeContextState,
);

export type OrderlyThemeProviderProps = {
  // dateFormatting?: string;
  components?: {
    [position in ExtensionPosition]: ComponentType;
  };
  overrides?: Partial<ComponentOverrides>;
};

export const useOrderlyTheme = () => {
  return useContext(OrderlyThemeContext);
};

export const OrderlyThemeProvider: React.FC<
  PropsWithChildren<OrderlyThemeProviderProps>
> = (props) => {
  const { components, overrides, children } = props;

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
    return { getComponentTheme: resolveComponentTheme };
  }, [resolveComponentTheme]);

  return (
    <OrderlyThemeContext.Provider value={memoizedValue}>
      <ComponentsProvider components={components}>
        {children}
      </ComponentsProvider>
    </OrderlyThemeContext.Provider>
  );
};
