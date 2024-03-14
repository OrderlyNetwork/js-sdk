// Import AlgoOrderType enum
import { AlgoOrderType } from "@orderly.network/types";
import {
  offsetToPrice,
  priceToOffset,
  offsetPercentageToPrice,
  priceToOffsetPercentage,
  pnlToPrice,
  priceToPnl,
} from "../utils"; // Import functions to be tested
import { OrderSide } from "@orderly.network/types";

describe("TP/SL Utils function", () => {
  describe("offsetToPrice", () => {
    test("Calculates price correctly for LONG/TAKE_PROFIT type with positive offset", () => {
      const inputs = {
        qty: 0.1,
        offset: 5000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };
      expect(offsetToPrice(inputs)).toBe(71000);
    });
    test("Calculates price correctly for LONG/STOP_LESS type with positive offset", () => {
      const inputs = {
        qty: 0.1,
        offset: 10000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };
      expect(offsetToPrice(inputs)).toBe(56000);
    });

    test("Calculates price correctly for SHORT/TAKE_PROFIT type with negative offset", () => {
      const inputs = {
        qty: -0.1,
        offset: 5000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };
      expect(offsetToPrice(inputs)).toBe(61000);
    });

    test("Calculates price correctly for SHORT/STOP_LOSS type with negative offset", () => {
      const inputs = {
        qty: -0.1,
        offset: 10000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };
      expect(offsetToPrice(inputs)).toBe(76000);
    });
  });

  describe("priceToOffset", () => {
    test("Calculates offset correctly for LONG/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffset(inputs)).toBe(1000);
    });
    test("Calculates offset correctly for LONG/STOP_LOSS type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 63000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToOffset(inputs)).toBe(3000);
    });

    test("Calculates offset correctly for SHORT/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 63000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffset(inputs)).toBe(3000);
    });

    test("Calculates offset correctly for SHORT/STOP_LOSS type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToOffset(inputs)).toBe(1000);
    });
  });

  describe("offsetPercentageToPrice", () => {
    test("Calculates price correctly for LONG/TAKE_PROFIT type with positive percentage offset", () => {
      const inputs = {
        qty: 0.1,
        percentage: 0.15,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(offsetPercentageToPrice(inputs)).toBe(75900);
    });

    test("Calculates price correctly for LONG/STOP_LOSS type with positive percentage offset", () => {
      const inputs = {
        qty: 0.1,
        percentage: 0.2,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(offsetPercentageToPrice(inputs)).toBe(52800);
    });

    test("Calculates price correctly for SHORT/STOP_LOSS type with positive percentage offset", () => {
      const inputs = {
        qty: -0.1,
        percentage: 0.15,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(offsetPercentageToPrice(inputs)).toBe(56100);
    });

    test("Calculates price correctly for SHORT/STOP_LOSS type with positive percentage offset", () => {
      const inputs = {
        qty: -0.1,
        percentage: 0.2,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(offsetPercentageToPrice(inputs)).toBe(79200);
    });
  });

  describe("priceToOffsetPercentage", () => {
    test("Calculates offset percentage correctly for LONG/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffsetPercentage(inputs)).toBe(0.015151515151515152);
    });
    test("Calculates offset percentage correctly for LONG/STOP_LOSS type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 63000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToOffsetPercentage(inputs)).toBe(0.045454545454545456);
    });

    test("Calculates offset percentage correctly for SHORT/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 63000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffsetPercentage(inputs)).toBe(0.045454545454545456);
    });

    test("Calculates offset percentage correctly for SHORT/STOP_LOSS type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToOffsetPercentage(inputs)).toBe(0.015151515151515152);
    });
  });

  describe("pnlToPrice", () => {
    test("Calculates price correctly for LONG/TAKE_PROFIT type with positive pnl", () => {
      const inputs = {
        qty: 0.1,
        pnl: 200,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(pnlToPrice(inputs)).toBe(68000);
    });

    test("Calculates price correctly for LONG/STOP_LOSS type with negative pnl", () => {
      const inputs = {
        qty: 0.1,
        pnl: -500,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(pnlToPrice(inputs)).toBe(61000);
    });

    test("Calculates price correctly for SHORT/TAKE_PROFIT type with positive pnl", () => {
      const inputs = {
        qty: -0.1,
        pnl: 200,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(pnlToPrice(inputs)).toBe(64000);
    });

    test("Calculates price correctly for SHORT/STOP_LOSS type with negative pnl", () => {
      const inputs = {
        qty: -0.1,
        pnl: -500,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(pnlToPrice(inputs)).toBe(71000);
    });
  });

  describe("priceToPnl", () => {
    test("Calculates pnl correctly for LONG/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToPnl(inputs)).toBe(100);
    });

    test("Calculates pnl correctly for LONG/STOP_LOSS type with target price below mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 65000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToPnl(inputs)).toBe(-100);
    });

    test("Calculates pnl correctly for SHORT/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 65000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToPnl(inputs)).toBe(100);
    });

    test("Calculates pnl correctly for SHORT/STOP_LOSS type with target price below mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToPnl(inputs)).toBe(-100);
    });
  });
});
