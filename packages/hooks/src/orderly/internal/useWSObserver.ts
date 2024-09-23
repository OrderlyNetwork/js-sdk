import { useEffect } from "react";
import { useWS } from "../../useWS";
import { useMarkPriceActions } from "../useMarkPrice/useMarkPriceStore";
import { Calculator, CalculatorScope } from "../../types";
import { CalculatorService } from "../calculator/calculatorService";

export const useWSObserver = (calculatorService: CalculatorService) => {
  const ws = useWS();
  const { updateMarkPrice } = useMarkPriceActions();

  useEffect(() => {
    console.log("[ORDERLY SDK]: subscribing to ws...");
    /// subscribe to the ws;
    const markPriceSubscription = ws.subscribe("markprices", {
      onMessage: (message: any) => {
        const data: Record<string, number> = Object.create(null);

        for (let index = 0; index < message.length; index++) {
          const element = message[index];
          data[element.symbol] = element.price;
        }

        updateMarkPrice(data);
        // call the calculator service
        calculatorService.calc(CalculatorScope.MARK_PRICE, data, {
          skipPending: true,
        });
      },

      onError: (error: any) => {},
    });

    return () => {
      markPriceSubscription?.();
    };
  }, []);
};
