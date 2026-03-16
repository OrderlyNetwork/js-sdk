import { OrderEntity, OrderType, OrderlyOrder } from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderValidationResult } from "./interface";
import { QuantityValidator } from "./validators/QuantityValidator";
import { SlippageValidationStrategy } from "./validators/SlippageValidationStrategy";
import { SlippageValidator } from "./validators/SlippageValidator";
import { ValidationChain } from "./validators/ValidationChain";

/**
 * Creator for market orders
 * Uses Strategy pattern for validation and Template Method pattern for creation
 */
export class MarketOrderCreator extends BaseOrderCreator<OrderEntity> {
  private slippageValidationStrategy = new SlippageValidationStrategy();
  private validationChain = new ValidationChain()
    .addValidator(new QuantityValidator())
    .addValidator(new SlippageValidator());

  /**
   * Builds the market order
   * Implements template method hook
   */
  protected buildOrder(
    values: OrderEntity,
    config?: ValuesDepConfig,
  ): OrderEntity {
    // Cast to OrderlyOrder for baseOrder method which expects OrderlyOrder
    const orderlyValues = values as unknown as OrderlyOrder;
    const data = this.baseOrder(orderlyValues);

    // Remove fields that should not be in market orders
    // Using type assertion to safely delete optional properties
    const result = { ...data } as Partial<OrderlyOrder>;
    delete result.order_price;
    delete result.total;
    delete result.trigger_price;
    // isStopOrder might not be in the type definition but could exist at runtime
    if ("isStopOrder" in result) {
      delete (result as any).isStopOrder;
    }

    return result as OrderEntity;
  }

  /**
   * Runs validations using validation chain
   * Implements template method hook
   */
  protected runValidations(
    values: OrderEntity,
    configs: ValuesDepConfig,
  ): OrderValidationResult {
    // Cast to OrderlyOrder for baseValidate method which expects OrderlyOrder
    const orderlyValues = values as unknown as OrderlyOrder;
    const result = this.baseValidate(orderlyValues, configs);

    // Use validation chain for quantity and slippage validation
    const chainErrors = this.validationChain.validate(orderlyValues, configs);
    Object.assign(result, chainErrors);

    return result;
  }

  orderType = OrderType.MARKET;
}
