import { API } from "@orderly.network/types";
import { Calculator, CalculatorScope } from "../../types";
import { BaseCalculator } from "./baseCalculator";

class OrderCalculator extends BaseCalculator<API.OrderExt[]> {
  name = "orders";
  calc(
    scope: CalculatorScope,
    markPrice: Record<string, number>
  ): API.OrderExt[] {
    // Implementation logic here
    return [];
  }

  update(data: API.OrderExt[]): void {
    // Implementation logic here
  }
}
