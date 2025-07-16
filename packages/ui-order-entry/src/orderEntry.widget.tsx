import {
  OrderEntryScriptInputs,
  useOrderEntryScript,
} from "./orderEntry.script";
import { OrderEntry } from "./orderEntry.ui";

export const OrderEntryWidget = (
  props: OrderEntryScriptInputs & {
    containerRef?: any;
    disableFeatures?: ("slippageSetting" | "feesInfo")[];
  },
) => {
  const state = useOrderEntryScript(props);
  return (
    <OrderEntry
      {...state}
      containerRef={props.containerRef}
      disableFeatures={props.disableFeatures}
    />
  );
};
