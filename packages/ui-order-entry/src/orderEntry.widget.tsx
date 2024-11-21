import { OrderEntry } from "./orderEntry.ui";
import {
  OrderEntryScriptInputs,
  useOrderEntryScript,
} from "./useOrderEntry.script";

export const OrderEntryWidget = (props: OrderEntryScriptInputs & {
  containerRef?: any;
}) => {
  const state = useOrderEntryScript(props);
  return <OrderEntry {...state} containerRef={props.containerRef}/>;
};
