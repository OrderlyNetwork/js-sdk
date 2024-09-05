import { SimpleDI } from "@orderly.network/core";
import { Calculator, CalculatorScheduler } from "../../types";

class CalculatorService {
  private calculators: Map<string, Calculator[]>;

  constructor(
    private readonly scheduler: CalculatorScheduler,
    queue: [string, Calculator[]][]
  ) {
    this.calculators = new Map(queue);
  }

  register(scope: string, calculator: Calculator) {
    const queue = this.calculators.get(scope);
    if (Array.isArray(queue)) {
      queue.push(calculator);
    } else {
      this.calculators.set(scope, [calculator]);
    }
  }

  unregister(scope: string, calculator: Calculator) {
    const queue = this.calculators.get(scope);
    if (Array.isArray(queue)) {
      const index = queue.indexOf(calculator);
      if (index > -1) {
        queue.splice(index, 1);
      }
    }
  }

  calc(scope: string, data: any) {
    const queue = this.calculators.get(scope);

    if (Array.isArray(queue) && queue.length) {
      this.scheduler.calc(queue, data);
    }
  }
}

const CalculatorServiceID = "CalculatorService";

// SimpleDI.registerByName(CalculatorServiceID, CalculatorService);

export { CalculatorService, CalculatorServiceID };
