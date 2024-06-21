import { ComponentType, FC, PropsWithChildren } from "react";
import { ExtensionPosition } from "../plugin";
import { ComponentsProvider } from "./componentProvider";

export type OrderlyThemeProviderProps = {
  dateFormatting?: string;
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
