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

type GetComponentTheme = <T extends keyof ComponentOverrides>(
  component: T,
  defaultValue?: ComponentOverrides[T],
) => ComponentOverrides[T];

export type OrderlyThemeContextState = {
  // overrides?: Partial<ComponentOverrides>;
  getComponentTheme: GetComponentTheme;
};

export const OrderlyThemeContext = createContext(
  {} as OrderlyThemeContextState,
);

export const useOrderlyTheme = () => {
  return useContext(OrderlyThemeContext);
};
