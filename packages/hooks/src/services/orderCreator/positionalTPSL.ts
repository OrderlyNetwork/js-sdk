import { OrderEntity } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderFormEntity, VerifyResult } from "./interface";
import { AlgoOrderEntry } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";

export class PositionalTPSLOrderCreator extends BaseOrderCreator<
  AlgoOrderEntry<AlgoOrderRootType.POSITIONAL_TP_SL>
> {
  create(
    values: AlgoOrderEntry<AlgoOrderRootType.POSITIONAL_TP_SL>,
    config: ValuesDepConfig
  ) {
    throw new Error("Method not implemented.");
  }
  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    throw new Error("Method not implemented.");
  }
}
