import { API, WSMessage } from "@orderly.network/types";
import { BaseMergeHandler } from "./baseMergeHandler";
import { object2underscore } from "../../utils/ws";

export class AlgoOrderMergeHandler extends BaseMergeHandler<
  WSMessage.AlgoOrder[],
  API.AlgoOrder
> {
  get orderId(): number {
    return this.data.algo_order_id;
  }

  get status(): string {
    return this.data.root_algo_status;
  }

  //   merge(
  //     key: string,
  //     message: WSMessage.AlgoOrder[],
  //     prevData: API.OrderResponse[]
  //   ): API.OrderResponse[] | undefined {
  //     switch (this.status) {
  //       case "TRIGGER": {
  //       }
  //       default:
  //         return super.merge(key, message, prevData);
  //     }
  //   }

  pre(
    message: WSMessage.AlgoOrder[],
    prevData?: API.OrderResponse[]
  ): API.AlgoOrder {
    return AlgoOrderMergeHandler.groupOrders(message);
  }

  static groupOrders(orders: WSMessage.AlgoOrder[]): API.AlgoOrder {
    const rootOrderIndex = orders.findIndex(
      (order) =>
        order.parentAlgoOrderId === 0 &&
        order.algoOrderId === order.rootAlgoOrderId
    );
    if (rootOrderIndex === -1) {
      throw new Error("Root order not found");
    }

    const rootOrder_ = object2underscore(
      orders[rootOrderIndex]
    ) as unknown as API.AlgoOrder;

    rootOrder_.child_orders = orders
      .filter((_, index) => index !== rootOrderIndex)
      .map((order) => {
        return object2underscore(order) as unknown as API.AlgoOrder;
      });

    return rootOrder_;
  }
}
