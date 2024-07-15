import { useOrdersBuilder } from "./useBuilder.script";
import { Orders } from "./orders.ui";

export const OrdersWidget = () => {
  const state = useOrdersBuilder();

  return <Orders {...state} />;
};
