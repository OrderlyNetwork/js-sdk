import { OrderEntry } from "./orderEntry.ui";
import {
  OrderEntryScriptInputs,
  useOrderEntryScript,
} from "./useOrderEntry.script";

export const OrderEntryWidget = (props: OrderEntryScriptInputs) => {
  const state = useOrderEntryScript(props);
  return <OrderEntry {...state} />;
};
