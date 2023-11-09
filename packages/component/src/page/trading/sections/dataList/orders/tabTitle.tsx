import { useEffect, useMemo } from "react";
import {
  usePrivateQuery,
  OrderStatus,
  useEventEmitter,
} from "@orderly.network/hooks";

export const OrdersTabTitle = () => {
  const ee = useEventEmitter();

  const { data: pendings, mutate } = usePrivateQuery(
    `/v1/orders?status=${OrderStatus.INCOMPLETE}`
  );

  // Hack: 为了让订单数字及时更新，这里需要订阅订单的变化, 这里跟列表页的有重叠，后续优化
  useEffect(() => {
    const handler = () => {
      mutate();
    };

    ee.on("orders:changed", handler);

    return () => {
      ee.off("orders:changed", handler);
    };
  }, []);

  const pendingCount = useMemo(() => {
    if (!Array.isArray(pendings)) return 0;
    return pendings.length;
  }, [pendings]);

  if (pendingCount === 0) {
    return <>{"Pending"}</>;
  }

  return <>{`Pending(${pendingCount})`}</>;
};
