import { ComponentType, FC, PropsWithChildren } from "react";
import { ExtensionPosition } from "../plugin/types";
import { ComponentsProvider } from "./componentProvider";

export type OrderlyAppProviderProps = {
  components?: {
    [position in ExtensionPosition]: ComponentType;
  };
};

export const OrderlyAppProvider: FC<
  PropsWithChildren<OrderlyAppProviderProps>
> = (props) => {
  return (
    <ComponentsProvider components={props.components}>
      {props.children}
    </ComponentsProvider>
  );
};
