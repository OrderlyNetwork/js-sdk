import { SimpleDI } from "@orderly.network/core";
import useConstant from "use-constant";
import { useSimpleDI } from "./useSimpleDI";
import {
  CalculatorService,
  CalculatorServiceID,
} from "./orderly/calculator/calculatorService";
import { ShardingScheduler } from "./orderly/calculator/shardedScheduler";
import { PositionCalculator } from "./orderly/calculator/positions";
import { MarkPriceCalculator } from "./orderly/calculator/markPrice";
import { CalculatorScope } from "./types";
import { PortfolioCalculator } from "./orderly/calculator/portfolio";

export const useCalculatorService = () => {
  const { get } = useSimpleDI<CalculatorService>();
  const calculatorService = useConstant(() => {
    let calculatorService = get(CalculatorServiceID);

    if (!calculatorService) {
      const positionCalculator = new PositionCalculator();
      const portfolioCalculator = new PortfolioCalculator();
      const markPriceCalculator = new MarkPriceCalculator();
      calculatorService = new CalculatorService(new ShardingScheduler(), [
        [
          CalculatorScope.MARK_PRICE,
          [markPriceCalculator, positionCalculator, portfolioCalculator],
        ],
        [CalculatorScope.POSITION, [positionCalculator]],
      ]);

      SimpleDI.registerByName(CalculatorServiceID, calculatorService);
    }
    return calculatorService;
  });

  return calculatorService;
};
