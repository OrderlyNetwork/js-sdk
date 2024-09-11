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

  private pendingCalc: { scope: CalculatorScope; data: any }[] = [];

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

  async calc(
    scope: CalculatorScope,
    data: any,
    options?: {
      skipUpdate?: boolean;
      skipPending?: boolean;
    }
  ) {
    // this.pendingCalc.push({ scope, data });

    const queue = this.calculators.get(scope);

    const ctx = new CalculatorContext(scope, data);
    // if accountInfo, symbolsInfo, fundingRates are not ready, push to pendingCalc
    if (!ctx.isReady && !options?.skipPending) {
      this.pendingCalc.push({ scope, data });
      return;
    }

    // handle pending calc
    this.handlePendingCalc();

    if (Array.isArray(queue) && queue.length) {
      await this.scheduler.calc(scope, queue, data, ctx);

      // console.log("[calc done:]", scope, ctx.outputToValue());
      if (!options?.skipUpdate) {
        this.scheduler.update(scope, queue, ctx.outputToValue());
      }
    }
  }

  private handlePendingCalc() {
    while (this.pendingCalc.length) {
      const item = this.pendingCalc.shift();
      if (item) {
        const { scope, data } = item;
        this.calc(scope, data, { skipUpdate: false });
      }
    }
  }
}

const CalculatorServiceID = "CalculatorService";

// SimpleDI.registerByName(CalculatorServiceID, CalculatorService);

export { CalculatorService, CalculatorServiceID };
