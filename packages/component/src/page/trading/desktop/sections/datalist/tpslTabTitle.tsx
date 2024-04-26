import { AlgoOrderRootType, OrderStatus } from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { memo } from "react";

export const TPSLTabTitle = () => {
  const [_, { total }] = useOrderStream(
    {
      status: OrderStatus.INCOMPLETE,
      includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
    },
    {
      keeplive: true,
    }
  );

  if (total === 0) {
    return <>{"TP/SL"}</>;
  }

  return <>{`TP/SL(${total})`}</>;
};

export const MemoizedTPSLTabTitle = memo(TPSLTabTitle);
