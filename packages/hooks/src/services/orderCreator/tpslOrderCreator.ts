import { OrderEntity, AlgoOrderEntry, OrderType } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderFormEntity, VerifyResult } from "./interface";
import { TriggerPriceType } from "@orderly.network/types";
import { AlgoOrderType } from "@orderly.network/types";
import { AlogOrderRootType } from "@orderly.network/types/src/order";

export class TPSLOrderCreator extends BaseOrderCreator<
  AlgoOrderEntry<AlogOrderRootType.TP_SL>
> {
  create(
    values: AlgoOrderEntry<AlogOrderRootType.TP_SL>,
    config: ValuesDepConfig
  ) {
    return {
      algo_type: AlogOrderRootType.TP_SL,
      trigger_price_type: TriggerPriceType.MARK_PRICE,
      reduce_only: true,
      quantity: values.quantity,
      symbol: values.symbol,
      child_orders: [
        {
          algo_type: AlgoOrderType.TAKE_PROFIT,
          reduce_only: true,
          side: values.side,
          type: OrderType.MARKET,
          trigger_price: values.tp_trigger_price,
          symbol: values.symbol,
        },
        {
          algo_type: AlgoOrderType.STOP_LOSS,
          reduce_only: true,
          side: values.side,
          type: OrderType.MARKET,
          trigger_price: values.sl_trigger_price,
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
