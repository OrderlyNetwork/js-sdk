import { Calculator, CalculatorCtx, CalculatorScope } from "../../types";

abstract class BaseCalculator<T> implements Calculator<T> {
  abstract name: string;
  private _cache?: T;
  abstract calc(scope: CalculatorScope, data: any, ctx: CalculatorCtx): T;
  abstract update(data: T): void;

  cache(data: T) {
    this._cache = data;
  }
}

export { BaseCalculator };
