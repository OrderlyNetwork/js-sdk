import { OrdersView } from "@/block/orders";

export const OrdersPane = () => {
  return <OrdersView dataSource={[]} isLoading={false} symbol={""} />;
};
