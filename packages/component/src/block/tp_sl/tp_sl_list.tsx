import { TPSLListView } from "@/block/tp_sl/tpsl_listview";
import { FC, useContext, useState } from "react";
import { TabContext } from "@/tab";
import { Divider } from "@/divider";
import { Header } from "@/block/orders/full/header";
import {
  API,
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
  OrderEntity,
} from "@orderly.network/types";
import { useOrderStream } from "@orderly.network/hooks";
import { OrderListProvider } from "../orders/shared/orderListContext";

export const TPSLList: FC<{
  // dataSource: API.AlgoOrder[];
}> = (props) => {
  const { height } = useContext(TabContext);
  const [side, setSide] = useState<OrderSide>();

  const [orders, { total }] = useOrderStream(
    {
      status: OrderStatus.INCOMPLETE,
      side,
      includes: [AlgoOrderRootType.POSITIONAL_TP_SL, AlgoOrderRootType.TP_SL],
    },
    {
      keeplive: true,
    }
  );

  // console.log("orders", orders);

  return (
    <div>
      <Header
        count={orders?.length ?? 0}
        onSideChange={setSide}
        side={side}
        orderType={AlgoOrderRootType.TP_SL}
        status={OrderStatus.INCOMPLETE}
      />
      <Divider />
      <div
        className="orderly-relative"
        style={{ height: `${(height?.content ?? 100) - 55}px` }}
      >
        <TPSLListView dataSource={orders ?? []} />
      </div>
    </div>
  );
};
