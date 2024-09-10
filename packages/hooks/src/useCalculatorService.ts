import { SimpleDI } from "@orderly.network/core";
import useConstant from "use-constant";
import { useSimpleDI } from "./useSimpleDI";
import {
  CalculatorService,
  CalculatorServiceID,
} from "./orderly/calculator/calculatorService";
import { ShardingScheduler } from "./orderly/calculator/shardedScheduler";
import { PositionCalculator } from "./orderly/calculator/positions";
import { CalculatorScope } from "./types";

export const useCalculatorService = () => {
  const { get } = useSimpleDI<CalculatorService>();
  const calculatorService = useConstant(() => {
    let calculatorService = get(CalculatorServiceID);

    if (!calculatorService) {
      const positionCalculator = new PositionCalculator();
      calculatorService = new CalculatorService(new ShardingScheduler(), [
        [CalculatorScope.MARK_PRICE, [positionCalculator]],
        [CalculatorScope.POSITION, [positionCalculator]],
      ]);

      SimpleDI.registerByName(CalculatorServiceID, calculatorService);
    }
    return calculatorService;
  });

  return calculatorService;
};
