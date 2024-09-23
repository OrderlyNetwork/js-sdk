import {
  Calculator,
  CalculatorCtx,
  CalculatorScheduler,
  CalculatorScope,
} from "../../types";
import { CalculatorContext } from "./calculatorContext";

type CalcOptions = {
  skipUpdate?: boolean;
  skipPending?: boolean;
};

type CalcItem = {
  scope: CalculatorScope;
  data: any;
  options?: CalcOptions;
};

class CalculatorService {
  private calculators: Map<string, Calculator[]>;

  private pendingCalc: CalcItem[] = [];

  private calcQueue: CalcItem[] = [];

  constructor(
    private readonly scheduler: CalculatorScheduler,
    calculators: [string, Calculator[]][]
  ) {
    this.calculators = new Map(calculators);
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

  async calc(scope: CalculatorScope, data: any, options?: CalcOptions) {
    const ctx = new CalculatorContext(scope, data);
    // if accountInfo, symbolsInfo, fundingRates are not ready, push to pendingCalc
    if (!ctx.isReady && !options?.skipPending) {
      this.pendingCalc.push({ scope, data, options });
      return;
    }

    // handle pending calc
    this.handlePendingCalc();

    this.calcQueue.push({ scope, data, options });

    this.handleCalcQueue(ctx);
  }

  private async handlePendingCalc() {
    while (this.pendingCalc.length) {
      const item = this.pendingCalc.shift();
      if (item) {
        const { scope, data } = item;
        await this.calc(scope, data, { skipUpdate: false });
      }
    }
  }

  private async handleCalcQueue(context?: CalculatorContext) {
    const first = this.calcQueue.shift();
    if (first) {
      // console.log("[calcQueue:]", first);
      const { scope, data, options } = first;
      const ctx = context || new CalculatorContext(scope, data);
      const calculators = this.calculators.get(scope);
      if (Array.isArray(calculators) && calculators.length) {
        await this.scheduler.calc(scope, calculators, data, ctx);
        if (!options?.skipUpdate) {
          this.scheduler.update(scope, calculators, ctx.outputToValue());
        }
      }
      if (this.calcQueue.length) {
        requestAnimationFrame(() => this.handleCalcQueue());
      }
    }
  }
}

const CalculatorServiceID = "CalculatorService";

// SimpleDI.registerByName(CalculatorServiceID, CalculatorService);

export { CalculatorService, CalculatorServiceID };
