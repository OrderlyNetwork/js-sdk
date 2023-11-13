import { useEffect, useMemo, useRef } from "react";
import { usePrivateQuery, useEventEmitter } from "@orderly.network/hooks";
import { OrderStatus } from "@orderly.network/types";

export const OrdersTabTitle = () => {
  const ee = useEventEmitter();
  const timer = useRef<any>();
  const timestamp = useRef<any>();

  const { data, mutate } = usePrivateQuery(
    `/v1/orders?status=${OrderStatus.INCOMPLETE}`,
    { formatter: (data: any) => data }
  );

  // Hack: 为了让订单数字及时更新，这里需要订阅订单的变化, 这里跟列表页的有重叠，后续优化
  useEffect(() => {
    const handler = (data: any) => {
      // 如果100豪秒内有订单状态更新
      if (timestamp.current && Date.now() - timestamp.current < 100) {
        timer.current && clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        mutate();
      }, 100);
      timestamp.current = Date.now();
    };

    ee.on("orders:changed", handler);

    return () => {
      ee.off("orders:changed", handler);
    };
  }, []);

  const total = useMemo(() => {
    return data?.meta?.total || 0;
  }, [data]);

  if (total === 0) {
    return <>{"Pending"}</>;
  }

  return <>{`Pending(${total})`}</>;
};
