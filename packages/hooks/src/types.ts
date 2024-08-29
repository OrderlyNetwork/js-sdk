import { StateCreator } from "zustand";

// export type ImmerStateCreator<T> = StateCreator<CommonState, [["zustand/immer", never], never], [], T>;
export interface Calculator<T = any> {
  calc: (markPrice: Record<string, number>) => T;
  update: (data: T) => void;
}

export interface CalculatorScheduler {
  calc: (calculators: Calculator[], data: any) => void;

  // run: (calculators: Calculator[]) => void;
}
