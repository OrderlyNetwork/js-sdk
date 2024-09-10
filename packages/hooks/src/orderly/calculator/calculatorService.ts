import { SimpleDI } from "@orderly.network/core";
import {
  Calculator,
  CalculatorCtx,
  CalculatorScheduler,
  CalculatorScope,
} from "../../types";
import { useAppStore } from "../appStore";
import { API } from "@orderly.network/types";
import { CalculatorContext } from "./calculatorContext";
class CalculatorService {
  private calculators: Map<string, Calculator[]>;

  private pendingCalc: { scope: string; data: any }[] = [];

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

  async calc(scope: CalculatorScope, data: any) {
    const queue = this.calculators.get(scope);

    const ctx = new CalculatorContext();
    // if accountInfo, symbolsInfo, fundingRates are not ready, push to pendingCalc
    if (!ctx.isReady) {
      this.pendingCalc.push({ scope, data });
      return;
    }

    if (Array.isArray(queue) && queue.length) {
      await this.scheduler.calc(scope, queue, data, ctx);

      console.log("calc done:", ctx.outputToValue());
      this.scheduler.update(scope, queue, data);
    }
  }
}

const CalculatorServiceID = "CalculatorService";

// SimpleDI.registerByName(CalculatorServiceID, CalculatorService);

export { CalculatorService, CalculatorServiceID };
