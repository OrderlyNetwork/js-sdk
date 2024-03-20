import {
  MMR,
  extractSymbols,
  maxQty,
  otherIMs,
  maxQtyByLong,
  maxQtyByShort,
} from "../src/account"; // Update the path to your source file

describe("account farmula", () => {
  describe("extractSymbols", () => {
    test("should extract unique symbols from positions and orders", () => {
      const positions = [
        { symbol: "AAPL" },
        { symbol: "GOOGL" },
        { symbol: "AAPL" }, // Duplicate symbol
      ];

      const orders = [{ symbol: "GOOGL" }, { symbol: "MSFT" }];

      const symbols = extractSymbols(positions, orders);

      expect(symbols).toEqual(
        expect.arrayContaining(["AAPL", "GOOGL", "MSFT"])
      );
      expect(symbols).toHaveLength(3);
    });
  });

  describe("maxQty", () => {
    test("maxQty long", () => {
      const data = {
        markPrice: 25986.2,
        symbol: "PERP_BTC_USDC",
        baseMaxQty: 20,
        totalCollateral: 1981.66,
        maxLeverage: 10,
        takerFeeRate: 8,
        baseIMR: 0.1,
        otherIMs: 491.523,
        positionQty: 0.2,
        buyOrdersQty: 0.3,
        sellOrdersQty: 0.5,
        IMR_Factor: 0.0000002512,
      };
      const qty = maxQtyByLong(data);
      //0.06158150257159509
      //0.0615815026
      expect(qty).toBe(0.06158150257159509);
    });

    test("maxQty short", () => {
      const data = {
        markPrice: 25986.2,
        symbol: "PERP_BTC_USDC",
        baseMaxQty: 20,
        totalCollateral: 1981.66,
        maxLeverage: 10,
        takerFeeRate: 8,
        baseIMR: 0.1,
        otherIMs: 491.523,
        positionQty: 0.2,
        buyOrdersQty: 0.3,
        sellOrdersQty: 0.5,
        IMR_Factor: 0.0000002512,
      };
      const qty = maxQtyByShort(data);
      /// 0.861581503

      expect(qty).toBe(0.26158150257159507);
    });

    test("maxQty: short position", () => {
      const data = {
        markPrice: 25986.2,
        symbol: "PERP_BTC_USDC",
        baseMaxQty: 20,
        totalCollateral: 1981.66,
        maxLeverage: 10,
        takerFeeRate: 8,
        baseIMR: 0.1,
        otherIMs: 491.523,
        positionQty: -0.3,
        buyOrdersQty: 0,
        sellOrdersQty: 0,
        IMR_Factor: 0.0000002512,
      };
      const qty = maxQtyByLong(data);

      // const shortQty = maxQtyByShort(data);
      /// 0.861581503

      //0.861581503
      expect(qty).toBe(0.861581502571595);
      // expect(shortQty).toBe(0.261581503);
    });
  });

  describe("MMR", () => {
    test("should return null if the user does not have any positions", () => {
      const inputs = {
        positionsNotional: 0,
        positionsMMR: 100,
      };

      const result = MMR(inputs);

      expect(result).toBeNull();
    });

    test("should calculate MMR correctly", () => {
      const inputs = {
        positionsNotional: 10112.43,
        positionsMMR: 505.61,
      };

      const result = MMR(inputs);

      expect(result).toBe(0.04999886278570037);
    });
  });
});
