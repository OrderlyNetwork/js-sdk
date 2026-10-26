import { API, OrderStatus, WSMessage } from "@orderly.network/types";
import { object2underscore } from "../../utils/ws";
import { BaseMergeHandler } from "./baseMergeHandler";

export class RegularOrderMergeHandler extends BaseMergeHandler<
  WSMessage.Order,
  API.Order
> {
  private readonly messageHasCreatedTime: boolean;

  constructor(message: WSMessage.Order) {
    super(message);
    const createdTime = (message as WSMessage.Order & { createdTime?: number })
      .createdTime;
    this.messageHasCreatedTime =
      Number.isFinite(createdTime) && createdTime! > 0;
  }

  get orderId(): number {
    return this.data.order_id;
  }
  get status(): string {
    return this.data.status;
  }
  pre(
    message: WSMessage.Order,
    prevData?: API.OrderResponse[] | undefined,
  ): API.Order {
    return object2underscore(message) as unknown as API.Order;
  }
  isFullFilled(): boolean {
    return (
      "total_executed_quantity" in this.data &&
      this.data.total_executed_quantity === this.data.quantity
    );
  }

  merge(
    key: string,
    message: WSMessage.Order,
    prevData: API.OrderResponse[],
  ): API.OrderResponse[] {
    // Without a status filter, the next key segment is a symbol, side or size.
    const segment = key.split(":")[1] as OrderStatus;
    const listStatus = Object.values(OrderStatus).includes(segment)
      ? segment
      : undefined;

    // All-order and filled caches retain completed records for history and executions.
    if (
      (!listStatus || listStatus === OrderStatus.FILLED) &&
      this.status === OrderStatus.FILLED
    ) {
      return this.insetOrUpdate(prevData);
    }

    if (
      listStatus === OrderStatus.PARTIAL_FILLED &&
      (this.status === OrderStatus.CANCELLED ||
        this.status === OrderStatus.REJECTED ||
        (this.status === OrderStatus.FILLED && this.isFullFilled()))
    ) {
      return this.remove(prevData);
    }

    if (this.status === OrderStatus.PARTIAL_FILLED) {
      switch (listStatus) {
        case OrderStatus.NEW:
          return this.remove(prevData);
        case OrderStatus.FILLED:
        case OrderStatus.CANCELLED:
        case OrderStatus.REJECTED:
        case OrderStatus.COMPLETED:
        case OrderStatus.REPLACED:
          return prevData;
        default:
          return this.insetOrUpdate(prevData);
      }
    }

    return super.merge(key, message, prevData);
  }

  update(prevData: API.OrderResponse[]): API.OrderResponse[] {
    const indices = this.findOrderIndex(prevData);
    // Inspect the original payload: formatOrder already fills created_time
    // from timestamp, but an execution update timestamp is not creation time.
    if (indices && !this.messageHasCreatedTime) {
      const original = prevData[indices[0]].rows[indices[1]];
      if (Number.isFinite(original.created_time) && original.created_time > 0)
        this.data.created_time = original.created_time;
    }
    return super.update(prevData);
  }
}
