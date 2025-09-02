import React from "react";
import {
  OrderEntryScriptInputs,
  useOrderEntryScript,
} from "./orderEntry.script";
import { OrderEntry } from "./orderEntry.ui";

export const OrderEntryWidget: React.FC<
  OrderEntryScriptInputs & {
    containerRef?: any;
    disableFeatures?: ("slippageSetting" | "feesInfo")[];
  }
> = (props) => {
  const state = useOrderEntryScript(props);
  return (
    <OrderEntry
      {...state}
      containerRef={props.containerRef}
      disableFeatures={props.disableFeatures}
    />
  );
};
