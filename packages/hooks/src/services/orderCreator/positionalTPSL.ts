import { OrderEntity } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderFormEntity, VerifyResult } from "./interface";

export class PositionalTPSLOrderCreator extends BaseOrderCreator {
  create(values: OrderEntity, config: ValuesDepConfig): OrderEntity {
    throw new Error("Method not implemented.");
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    throw new Error("Method not implemented.");
  }
}
