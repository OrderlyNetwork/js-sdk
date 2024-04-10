import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { FC, memo } from "react";

export const OrdersTabTitle: FC<{
  excludes?: AlgoOrderRootType[];
}> = (props) => {
  const {
    excludes = [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
  } = props;
  const [_, { total }] = useOrderStream(
    {
      status: OrderStatus.INCOMPLETE,
      excludes,
    },
    {
      keeplive: true,
    }
  );

  if (total === 0) {
    return <>Pending</>;
  }

  return <>{`Pending(${total})`}</>;
};

export const MemoizedOrdersTabTitle = memo(OrdersTabTitle);
