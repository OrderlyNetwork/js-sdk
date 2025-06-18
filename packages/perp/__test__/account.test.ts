import {
  MMR,
  extractSymbols,
  maxQty,
  otherIMs,
  maxQtyByLong,
  maxQtyByShort,
  collateralRatio,
  collateralContribution,
  LTV,
  maxWithdrawalUSDC,
  maxWithdrawalOtherCollateral,
} from "../src/account";

// Update the path to your source file

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
        expect.arrayContaining(["AAPL", "GOOGL", "MSFT"]),
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

  describe("collateralContribution should work", () => {
    test("collateralQty = 0, should return baseWeight", () => {
      const params: Parameters<typeof collateralRatio>[0] = {
        baseWeight: 0.8,
        discountFactor: 0.3,
        collateralQty: 0,
        indexPrice: 1000,
      };
      expect(collateralRatio(params)).toBe(0.8);
    });
    test("discountFactor = 0, should return min(baseWeight, K)", () => {
      const params: Parameters<typeof collateralRatio>[0] = {
        baseWeight: 1.2,
        discountFactor: 0,
        collateralQty: 100,
        indexPrice: 1,
      };
      expect(collateralRatio(params)).toBe(1.2);
    });
  });

  describe("collateralRatio should work", () => {
    it("should return correct result for positive values", () => {
      const params: Parameters<typeof collateralContribution>[0] = {
        collateralQty: 10,
        collateralRatio: 0.5,
        indexPrice: 2,
      };
      expect(collateralContribution(params)).toBe(10);
    });

    it("should return 0 when collateralQty is 0", () => {
      const params: Parameters<typeof collateralContribution>[0] = {
        collateralQty: 0,
        collateralRatio: 0.5,
        indexPrice: 100,
      };
      expect(collateralContribution(params)).toBe(0);
    });

    it("should return 0 when collateralRatio is 0", () => {
      const params: Parameters<typeof collateralContribution>[0] = {
        collateralQty: 100,
        collateralRatio: 0,
        indexPrice: 999,
      };
      expect(collateralContribution(params)).toBe(0);
    });

    it("should return 0 when indexPrice is 0", () => {
      const params: Parameters<typeof collateralContribution>[0] = {
        collateralQty: 100,
        collateralRatio: 0.9,
        indexPrice: 0,
      };
      expect(collateralContribution(params)).toBe(0);
    });

    it("should handle negative values", () => {
      const params: Parameters<typeof collateralContribution>[0] = {
        collateralQty: -1,
        collateralRatio: 0.5,
        indexPrice: 10,
      };
      expect(collateralContribution(params)).toBe(-5);
    });
  });

  describe("LTV calculation should work", () => {
    it("returns 0 when both USDC balance and uPnL are positive", () => {
      const params: Parameters<typeof LTV>[0] = {
        usdcBalance: 100,
        unpl: 50,
        collateralAssets: [{ qty: 1, indexPrice: 100, weight: 1 }],
      };
      expect(LTV(params)).toBe(0);
    });

    it("returns 0 when no collateral and both USDC balance and uPnL are negative", () => {
      const params: Parameters<typeof LTV>[0] = {
        usdcBalance: -100,
        unpl: -200,
        collateralAssets: [],
      };
      expect(LTV(params)).toBe(0);
    });

    it("returns 0 when only positive uPnL exists", () => {
      const params: Parameters<typeof LTV>[0] = {
        usdcBalance: 0,
        unpl: 50,
        collateralAssets: [{ qty: 1, indexPrice: 100, weight: 1 }],
      };
      // numerator = 0, denominator = 100 + 50 = 150
      expect(LTV(params)).toBe(0);
    });

    it("ignores negative collateral quantity", () => {
      const params: Parameters<typeof LTV>[0] = {
        usdcBalance: -10,
        unpl: 0,
        collateralAssets: [
          { qty: -100, indexPrice: 1000, weight: 1 }, // ignored
        ],
      };
      // numerator = 10, denominator = 0
      expect(LTV(params)).toBe(0);
    });
  });

  describe("maxWithdrawalUSDC should work", () => {
    it("returns the full USDC balance when freeCollateral - upnl is greater than USDC balance", () => {
      const inputs: Parameters<typeof maxWithdrawalUSDC>[0] = {
        USDCBalance: 1000,
        freeCollateral: 2000,
        upnl: 100,
      };
      expect(maxWithdrawalUSDC(inputs)).toBe(1000);
    });

    it("returns freeCollateral - upnl when that is less than USDC balance", () => {
      const inputs: Parameters<typeof maxWithdrawalUSDC>[0] = {
        USDCBalance: 1000,
        freeCollateral: 800,
        upnl: 100,
      };
      expect(maxWithdrawalUSDC(inputs)).toBe(700);
    });

    it("returns 0 if freeCollateral - upnl is negative", () => {
      const inputs: Parameters<typeof maxWithdrawalUSDC>[0] = {
        USDCBalance: 1000,
        freeCollateral: 500,
        upnl: 600,
      };
      expect(maxWithdrawalUSDC(inputs)).toBe(0);
    });

    it("returns 0 if USDCBalance is 0", () => {
      const inputs: Parameters<typeof maxWithdrawalUSDC>[0] = {
        USDCBalance: 0,
        freeCollateral: 1000,
        upnl: 200,
      };
      expect(maxWithdrawalUSDC(inputs)).toBe(0);
    });

    it("handles negative upnl correctly (adds to available collateral)", () => {
      const inputs: Parameters<typeof maxWithdrawalUSDC>[0] = {
        USDCBalance: 1000,
        freeCollateral: 800,
        upnl: -100,
      };
      expect(maxWithdrawalUSDC(inputs)).toBe(800);
    });

    it("returns 0 if all values are 0", () => {
      const inputs: Parameters<typeof maxWithdrawalUSDC>[0] = {
        USDCBalance: 0,
        freeCollateral: 0,
        upnl: 0,
      };
      expect(maxWithdrawalUSDC(inputs)).toBe(0);
    });
  });

  describe("maxWithdrawalOtherCollateral should work", () => {
    it("should return full collateralQty when freeCollateral allows it", () => {
      const inputs: Parameters<typeof maxWithdrawalOtherCollateral>[0] = {
        collateralQty: 100,
        freeCollateral: 1000,
        indexPrice: 10,
        weight: 1,
      };
      expect(maxWithdrawalOtherCollateral(inputs)).toBe(100);
    });

    it("should return limited qty based on freeCollateral", () => {
      const inputs: Parameters<typeof maxWithdrawalOtherCollateral>[0] = {
        collateralQty: 100,
        freeCollateral: 500,
        indexPrice: 10,
        weight: 1,
      };
      expect(maxWithdrawalOtherCollateral(inputs)).toBe(50);
    });

    it("should return 0 when freeCollateral is 0", () => {
      const inputs: Parameters<typeof maxWithdrawalOtherCollateral>[0] = {
        collateralQty: 100,
        freeCollateral: 0,
        indexPrice: 10,
        weight: 1,
      };
      expect(maxWithdrawalOtherCollateral(inputs)).toBe(0);
    });

    it("should return 0 when collateralQty is 0", () => {
      const inputs: Parameters<typeof maxWithdrawalOtherCollateral>[0] = {
        collateralQty: 0,
        freeCollateral: 1000,
        indexPrice: 10,
        weight: 1,
      };
      expect(maxWithdrawalOtherCollateral(inputs)).toBe(0);
    });

    it("should consider weight < 1 correctly", () => {
      const inputs: Parameters<typeof maxWithdrawalOtherCollateral>[0] = {
        collateralQty: 100,
        freeCollateral: 500,
        indexPrice: 10,
        weight: 0.5,
      };
      expect(maxWithdrawalOtherCollateral(inputs)).toBe(100);
    });

    it("should consider weight > 1 correctly", () => {
      const inputs: Parameters<typeof maxWithdrawalOtherCollateral>[0] = {
        collateralQty: 100,
        freeCollateral: 500,
        indexPrice: 10,
        weight: 2,
      };
      expect(maxWithdrawalOtherCollateral(inputs)).toBe(25);
    });

    it("should return 0 when indexPrice * weight is 0", () => {
      const inputs: Parameters<typeof maxWithdrawalOtherCollateral>[0] = {
        collateralQty: 100,
        freeCollateral: 1000,
        indexPrice: 0,
        weight: 1,
      };
      expect(maxWithdrawalOtherCollateral(inputs)).toBe(0);
    });
  });
});
