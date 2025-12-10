import { describe, it, expect } from "@jest/globals";
import { OrderSide, API } from "@orderly.network/types";
import {
  maxPrice,
  minPrice,
  scopePrice,
  orderFee,
  estLiqPrice,
  estLeverage,
  tpslROI,
} from "../order";

describe("Order Functions", () => {
  describe("maxPrice", () => {
    it("should calculate maximum price correctly", () => {
      const markprice = 100;
      const range = 0.05;
      const result = maxPrice(markprice, range);
      expect(result).toBe(105);
    });

    it("should handle zero range", () => {
      const markprice = 100;
      const range = 0;
      const result = maxPrice(markprice, range);
      expect(result).toBe(100);
    });
  });

  describe("minPrice", () => {
    it("should calculate minimum price correctly", () => {
      const markprice = 100;
      const range = 0.05;
      const result = minPrice(markprice, range);
      expect(result).toBe(95);
    });

    it("should handle zero range", () => {
      const markprice = 100;
      const range = 0;
      const result = minPrice(markprice, range);
      expect(result).toBe(100);
    });
  });

  describe("scopePrice", () => {
    it("should scope price for BUY orders", () => {
      const price = 100;
      const scope = 0.02;
      const result = scopePrice(price, scope, "BUY");
      expect(result).toBe(98);
    });

    it("should scope price for SELL orders", () => {
      const price = 100;
      const scope = 0.02;
      const result = scopePrice(price, scope, "SELL");
      expect(result).toBe(102);
    });
  });

  describe("orderFee", () => {
    it("should calculate order fee correctly", () => {
      const inputs = {
        qty: 10,
        price: 100,
        futuresTakeFeeRate: 0.001,
      };

      const result = orderFee(inputs);
      expect(result).toBe(10 * 100 * 0.001);
    });

    it("should handle zero quantity", () => {
      const inputs = {
        qty: 0,
        price: 100,
        futuresTakeFeeRate: 0.001,
      };

      const result = orderFee(inputs);
      expect(result).toBe(0);
    });

    it("should handle zero fee rate", () => {
      const inputs = {
        qty: 10,
        price: 100,
        futuresTakeFeeRate: 0,
      };

      const result = orderFee(inputs);
      expect(result).toBe(0);
    });
  });

  describe("estLiqPrice", () => {
    const mockPositions: Array<
      Pick<API.PositionExt, "position_qty" | "mark_price" | "symbol" | "mmr">
    > = [
      {
        symbol: "PERP_ETH_USDC",
        position_qty: 10,
        mark_price: 100,
        mmr: 0.05,
      },
      {
        symbol: "PERP_BTC_USDC",
        position_qty: 5,
        mark_price: 200,
        mmr: 0.04,
      },
    ];

    it("should estimate liquidation price correctly", () => {
      const inputs = {
        positions: mockPositions,
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: 5,
          price: 105,
        },
        totalCollateral: 2000,
        markPrice: 100,
        baseIMR: 0.05,
        baseMMR: 0.02,
        orderFee: 10,
        IMR_Factor: 0.002,
      };

      const result = estLiqPrice(inputs);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should return 0 when new quantity is 0", () => {
      const inputs = {
        positions: [
          {
            symbol: "PERP_ETH_USDC",
            position_qty: -10,
            mark_price: 100,
            mmr: 0.05,
          },
        ],
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: 10,
          price: 105,
        },
        totalCollateral: 2000,
        markPrice: 100,
        baseIMR: 0.05,
        baseMMR: 0.02,
        orderFee: 10,
        IMR_Factor: 0.002,
      };

      const result = estLiqPrice(inputs);
      expect(result).toBe(0);
    });

    it("should handle no existing positions", () => {
      const inputs = {
        positions: [],
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: 10,
          price: 105,
        },
        totalCollateral: 2000,
        markPrice: 100,
        baseIMR: 0.05,
        baseMMR: 0.02,
        orderFee: 10,
        IMR_Factor: 0.002,
      };

      const result = estLiqPrice(inputs);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should return 0 when denominator is zero", () => {
      const inputs = {
        positions: [
          {
            symbol: "PERP_ETH_USDC",
            position_qty: 10,
            mark_price: 100,
            mmr: 0.05,
          },
        ],
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: 0,
          price: 105,
        },
        totalCollateral: 2000,
        markPrice: 100,
        baseIMR: 0.05,
        baseMMR: 0.02,
        orderFee: 10,
        IMR_Factor: 0.002,
      };

      const result = estLiqPrice(inputs);
      expect(result).toBe(0);
    });

    it("should return max(0, price)", () => {
      const inputs = {
        positions: mockPositions,
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: -20, // Large negative position
          price: 10,
        },
        totalCollateral: 10, // Very low collateral
        markPrice: 100,
        baseIMR: 0.05,
        baseMMR: 0.02,
        orderFee: 100,
        IMR_Factor: 0.002,
      };

      const result = estLiqPrice(inputs);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("estLeverage", () => {
    const mockPositions: Array<
      Pick<API.PositionExt, "position_qty" | "mark_price" | "symbol">
    > = [
      {
        symbol: "PERP_ETH_USDC",
        position_qty: 10,
        mark_price: 100,
      },
    ];

    it("should estimate leverage correctly", () => {
      const inputs = {
        totalCollateral: 1000,
        positions: mockPositions,
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: 5,
          price: 105,
        },
      };

      const result = estLeverage(inputs);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should return null when total collateral is <= 0", () => {
      const inputs = {
        totalCollateral: 0,
        positions: mockPositions,
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: 5,
          price: 105,
        },
      };

      const result = estLeverage(inputs);
      expect(result).toBeNull();
    });

    it("should return null when sum position notional is 0", () => {
      const inputs = {
        totalCollateral: 1000,
        positions: [
          {
            symbol: "PERP_ETH_USDC",
            position_qty: 0,
            mark_price: 100,
          },
        ],
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: 0,
          price: 105,
        },
      };

      const result = estLeverage(inputs);
      expect(result).toBeNull();
    });

    it("should handle new order for new symbol", () => {
      const inputs = {
        totalCollateral: 1000,
        positions: mockPositions,
        newOrder: {
          symbol: "PERP_BTC_USDC",
          qty: 5,
          price: 200,
        },
      };

      const result = estLeverage(inputs);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should round to 2 decimal places", () => {
      const inputs = {
        totalCollateral: 333.33,
        positions: [
          {
            symbol: "PERP_ETH_USDC",
            position_qty: 1,
            mark_price: 100,
          },
        ],
        newOrder: {
          symbol: "PERP_ETH_USDC",
          qty: 0,
          price: 100,
        },
      };

      const result = estLeverage(inputs);
      const decimalPlaces = result
        ? result.toString().split(".")[1]?.length || 0
        : 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  describe("tpslROI", () => {
    it("should calculate ROI for take profit correctly", () => {
      const inputs = {
        side: OrderSide.BUY,
        type: "tp" as const,
        closePrice: 110,
        orderPrice: 100,
        leverage: 5,
      };

      const result = tpslROI(inputs);
      expect(result).toBeCloseTo(0.5, 2); // ((110-100)/100) * 5 = 0.5
    });

    it("should calculate ROI for stop loss correctly", () => {
      const inputs = {
        side: OrderSide.BUY,
        type: "sl" as const,
        closePrice: 95,
        orderPrice: 100,
        leverage: 5,
      };

      const result = tpslROI(inputs);
      expect(result).toBeCloseTo(-0.25, 2); // ((95-100)/100) * 5 = -0.25
    });

    it("should handle SELL orders correctly", () => {
      const inputs = {
        side: OrderSide.SELL,
        type: "tp" as const,
        closePrice: 90,
        orderPrice: 100,
        leverage: 5,
      };

      const result = tpslROI(inputs);
      expect(result).toBeCloseTo(0.5, 2); // ((90-100)/100) * 5 = -0.5, abs for short TP = 0.5
    });

    it("should handle zero leverage", () => {
      const inputs = {
        side: OrderSide.BUY,
        type: "tp" as const,
        closePrice: 110,
        orderPrice: 100,
        leverage: 0,
      };

      const result = tpslROI(inputs);
      expect(result).toBe(0);
    });

    it("should handle same prices", () => {
      const inputs = {
        side: OrderSide.BUY,
        type: "tp" as const,
        closePrice: 100,
        orderPrice: 100,
        leverage: 5,
      };

      const result = tpslROI(inputs);
      expect(result).toBe(0);
    });

    it("should handle zero order price (edge case)", () => {
      const inputs = {
        side: OrderSide.BUY,
        type: "tp" as const,
        closePrice: 110,
        orderPrice: 0,
        leverage: 5,
      };

      expect(() => tpslROI(inputs)).toThrow();
    });
  });
});
