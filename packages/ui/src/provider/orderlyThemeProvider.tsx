import {
  ComponentType,
  createContext,
  FC,
  PropsWithChildren,
  useContext,
} from "react";
import { ExtensionPosition } from "../plugin";
import { ComponentsProvider } from "./componentProvider";

type ComponentOverrides = {
  tabs: {
    variant: "text" | "contained";
  };
};
export type OrderlyThemeContextState = {
  // overrides?: Partial<ComponentOverrides>;
  getComponentTheme: <T = any>(
    component: keyof ComponentOverrides,
    defaultValue?: T
  ) => T;
};

const OrderlyThemeContext = createContext<OrderlyThemeContextState>(
  {} as OrderlyThemeContextState
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

export const OrderlyThemeProvider: FC<
  PropsWithChildren<OrderlyThemeProviderProps>
> = (props) => {
  return (
    <OrderlyThemeContext.Provider
      value={{
        // overrides: props.overrides,
        getComponentTheme: <T,>(
          component: keyof ComponentOverrides,
          defaultValue?: T
        ) => {
          return (props.overrides?.[component] || defaultValue) as T;
        },
      }}
    >
      <ComponentsProvider components={props.components}>
        {props.children}
      </ComponentsProvider>
    </OrderlyThemeContext.Provider>
  );
};
