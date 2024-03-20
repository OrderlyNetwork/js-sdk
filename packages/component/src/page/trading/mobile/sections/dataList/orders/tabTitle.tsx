import { OrderStatus } from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { memo } from "react";

export const OrdersTabTitle = () => {
  const [_, { total }] = useOrderStream(
    {
      status: OrderStatus.INCOMPLETE,
    },
    {
      keeplive: true,
    }
  );

  if (total === 0) {
    return <>{"Pending"}</>;
  }

  return <>{`Pending (${total})`}</>;
};

export const MemoizedOrdersTabTitle = memo(OrdersTabTitle);
