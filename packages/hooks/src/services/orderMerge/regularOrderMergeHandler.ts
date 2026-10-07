import { API, WSMessage } from "@orderly.network/types";
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
