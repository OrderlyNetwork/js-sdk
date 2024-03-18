import {
  AlgoOrderEntry,
  AlgoOrderType,
  OrderType,
  TriggerPriceType,
} from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { OrderFormEntity, ValuesDepConfig, VerifyResult } from "./interface";
import { AlogOrderRootType } from "@orderly.network/types/src/order";
import { OrderSide } from "@orderly.network/types";

export class TPSLPositionOrderCreator extends BaseOrderCreator<
  AlgoOrderEntry<AlogOrderRootType.POSITIONAL_TP_SL>
> {
  create(
    values: AlgoOrderEntry<AlogOrderRootType.POSITIONAL_TP_SL>
    // config: ValuesDepConfig
  ) {
    const side =
      values.side! === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;
    return {
      algo_type: AlogOrderRootType.POSITIONAL_TP_SL,
      trigger_price_type: TriggerPriceType.MARK_PRICE,
      // reduce_only: true,
      symbol: values.symbol,
      child_orders: [
        {
          algo_type: AlgoOrderType.TAKE_PROFIT,
          reduce_only: true,
          // side: (values.side!)===OrderSide.Buy?OrderSide.Sell:OrderSide.Buy,
          side,
          type: OrderType.CLOSE_POSITION,
          trigger_price: values.tp_trigger_price,
          trigger_price_type: TriggerPriceType.MARK_PRICE,
          symbol: values.symbol,
        },
        {
          algo_type: AlgoOrderType.STOP_LOSS,
          reduce_only: true,
          side,
          type: OrderType.CLOSE_POSITION,
          trigger_price: values.sl_trigger_price,
          trigger_price_type: TriggerPriceType.MARK_PRICE,
          symbol: values.symbol,
        },
      ],
    };
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    throw new Error("Method not implemented.");
  }
}
