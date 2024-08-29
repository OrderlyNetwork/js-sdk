import { Calculator, CalculatorScheduler } from "../../types";

class ShardedScheduler implements CalculatorScheduler {
  // run(calculators: Calculator[]) {}
  calc(calculators: Calculator[], data: any) {
    for (let index = 0; index < calculators.length; index++) {
      const calculator = calculators[index];
      const result = calculator.calc(data);
    }
  }
}

export { ShardedScheduler };
