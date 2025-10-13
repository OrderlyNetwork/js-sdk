import { OrderEntity } from "@kodiak-finance/orderly-types";
import { BaseOrderCreator } from "./baseCreator";
import {
  OrderFormEntity,
  ValuesDepConfig,
  OrderValidationResult,
} from "./interface";

export class MarketOrderCreator extends BaseOrderCreator<OrderEntity> {
  create(values: OrderEntity) {
    const data = this.baseOrder(values);

    delete data["order_price"];
    delete data["total"];
    delete data["trigger_price"];
    delete data["isStopOrder"];

    return {
      ...data,
    };
  }
  validate(
    values: OrderFormEntity,
    configs: ValuesDepConfig,
  ): Promise<OrderValidationResult> {
    // console.log("validate", values, configs);
    return this.baseValidate(values, configs).then((result) => {
      const slippage = Number(values.slippage);
      const estSlippage = Number.isNaN(configs.estSlippage)
        ? 0
        : Number(configs.estSlippage) * 100;
      if (!isNaN(slippage) && estSlippage > slippage) {
        return {
          ...result,
          slippage: {
            type: "max",
            message:
              "Estimated slippage exceeds your maximum allowed slippage.",
            value: estSlippage,
          },
        };
      }
      return result;
    });
  }
}
