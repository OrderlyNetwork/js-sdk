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
  chainSelector: {
    /**
     * show testnet chains list
     * @default true
     * */
    showTestnet: boolean;
  };
};

type GetComponentTheme = <T extends keyof ComponentOverrides>(
  component: T,
  defaultValue?: ComponentOverrides[T]
) => ComponentOverrides[T];

export type OrderlyThemeContextState = {
  // overrides?: Partial<ComponentOverrides>;
  getComponentTheme: GetComponentTheme;
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
  const getComponentTheme = <T extends keyof ComponentOverrides>(
    component: T,
    defaultValue?: ComponentOverrides[T]
  ) => {
    return (props.overrides?.[component] ||
      defaultValue) as ComponentOverrides[T];
  };

  return (
    <OrderlyThemeContext.Provider
      value={{
        // overrides: props.overrides,
        getComponentTheme,
      }}
    >
      <ComponentsProvider components={props.components}>
        {props.children}
      </ComponentsProvider>
    </OrderlyThemeContext.Provider>
  );
};
