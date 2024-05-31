import { ComponentType, FC, PropsWithChildren } from "react";
import { ExtensionPosition } from "../plugin/types";
import { ComponentsProvider } from "./componentProvider";

export type OrderlyThemeProviderProps = {
  components?: {
    [position in ExtensionPosition]: ComponentType;
  };
};

export const OrderlyThemeProvider: FC<
  PropsWithChildren<OrderlyThemeProviderProps>
> = (props) => {
  return (
    <ComponentsProvider components={props.components}>
      {props.children}
    </ComponentsProvider>
  );
};
