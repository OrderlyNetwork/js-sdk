import { OrderEntry } from "./orderEntry.ui";
import { useOrderEntryScript } from "./useOrderEntry.script";

export const OrderEntryWidget = () => {
  const state = useOrderEntryScript();
  return <OrderEntry {...state} />;
};
