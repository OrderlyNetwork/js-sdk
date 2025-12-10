import { describe, it, expect } from "@jest/globals";
import { API, OrderSide } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import {
  totalValue,
  freeCollateral,
  totalCollateral,
  positionNotionalWithOrder_by_symbol,
  positionQtyWithOrders_by_symbol,
  IMR,
  buyOrdersFilter_by_symbol,
  sellOrdersFilter_by_symbol,
  getQtyFromPositions,
  getQtyFromOrdersBySide,
  getPositonsAndOrdersNotionalBySymbol,
  totalInitialMarginWithOrders,
  totalInitialMarginWithQty,
  groupOrdersBySymbol,
  extractSymbols,
  otherIMs,
  maxQty,
  maxQtyByLong,
  maxQtyByShort,
  totalMarginRatio,
  totalUnrealizedROI,
  currentLeverage,
  availableBalance,
  MMR,
  collateralRatio,
  collateralContribution,
  LTV,
  maxWithdrawalUSDC,
  maxWithdrawalOtherCollateral,
  calcMinimumReceived,
  maxLeverage,
} from "../account";

describe("Account Functions", () => {
  describe("totalValue", () => {
    it("should calculate total value correctly", () => {
      const inputs = {
        totalUnsettlementPnL: 100,
        USDCHolding: 1000,
        nonUSDCHolding: [
          { holding: 10, indexPrice: 50 },
          { holding: 5, indexPrice: 100 },
        ],
      };

      const result = totalValue(inputs);
      expect(result.toNumber()).toBe(1000 + 10 * 50 + 5 * 100 + 100);
    });

    it("should handle empty non-USDC holdings", () => {
      const inputs = {
        totalUnsettlementPnL: 0,
        USDCHolding: 500,
        nonUSDCHolding: [],
      };

      const result = totalValue(inputs);
      expect(result.toNumber()).toBe(500);
    });
  });

  describe("freeCollateral", () => {
    it("should calculate free collateral correctly", () => {
      const inputs = {
        totalCollateral: new Decimal(1000),
        totalInitialMarginWithOrders: 200,
      };

      const result = freeCollateral(inputs);
      expect(result.toNumber()).toBe(800);
    });

    it("should return zero when free collateral is negative", () => {
      const inputs = {
        totalCollateral: new Decimal(100),
        totalInitialMarginWithOrders: 200,
      };

      const result = freeCollateral(inputs);
      expect(result.toNumber()).toBe(0);
    });
  });

  describe("totalCollateral", () => {
    it("should calculate total collateral correctly", () => {
      const inputs = {
        USDCHolding: 1000,
        nonUSDCHolding: [
          {
            holding: 10,
            indexPrice: 50,
            collateralCap: 20,
            collateralRatio: new Decimal(0.8),
          },
        ],
        unsettlementPnL: 50,
      };

      const result = totalCollateral(inputs);
      expect(result.toNumber()).toBe(1000 + 10 * 0.8 * 50 + 50);
    });

    it("should apply collateral cap when holding exceeds cap", () => {
      const inputs = {
        USDCHolding: 1000,
        nonUSDCHolding: [
          {
            holding: 30,
            indexPrice: 50,
            collateralCap: 20,
            collateralRatio: new Decimal(0.8),
          },
        ],
        unsettlementPnL: 0,
      };

      const result = totalCollateral(inputs);
      expect(result.toNumber()).toBe(1000 + 20 * 0.8 * 50);
    });
  });

  describe("positionNotionalWithOrder_by_symbol", () => {
    it("should calculate position notional with orders", () => {
      const inputs = {
        markPrice: 100,
        positionQtyWithOrders: 10,
      };

      const result = positionNotionalWithOrder_by_symbol(inputs);
      expect(result.toNumber()).toBe(1000);
    });
  });

  describe("positionQtyWithOrders_by_symbol", () => {
    it("should calculate position quantity with orders correctly", () => {
      const inputs = {
        positionQty: 10,
        buyOrdersQty: 5,
        sellOrdersQty: 3,
      };

      const result = positionQtyWithOrders_by_symbol(inputs);
      expect(result).toBe(Math.max(Math.abs(10 + 5), Math.abs(10 - 3)));
    });
  });

  describe("IMR", () => {
    it("should calculate initial margin rate correctly", () => {
      const inputs = {
        maxLeverage: 10,
        baseIMR: 0.05,
        IMR_Factor: 0.002,
        positionNotional: 10000,
        ordersNotional: 1000,
      };

      const result = IMR(inputs);
      expect(result).toBeGreaterThanOrEqual(0.1); // 1/maxLeverage
      expect(result).toBeGreaterThanOrEqual(0.05); // baseIMR
    });

    it("should use default IMR_factor_power", () => {
      const inputs = {
        maxLeverage: 10,
        baseIMR: 0.05,
        IMR_Factor: 0.002,
        positionNotional: 10000,
        ordersNotional: 1000,
      };

      const result1 = IMR(inputs);
      const result2 = IMR({ ...inputs, IMR_factor_power: 4 / 5 });
      expect(result1).toBe(result2);
    });
  });

  describe("order filters", () => {
    const mockOrders: API.Order[] = [
      { symbol: "PERP_ETH_USDC", side: OrderSide.BUY, quantity: 10 },
      { symbol: "PERP_ETH_USDC", side: OrderSide.SELL, quantity: 5 },
      { symbol: "PERP_BTC_USDC", side: OrderSide.BUY, quantity: 15 },
    ] as API.Order[];

    it("should filter buy orders by symbol", () => {
      const result = buyOrdersFilter_by_symbol(mockOrders, "PERP_ETH_USDC");
      expect(result).toHaveLength(1);
      expect(result[0].side).toBe(OrderSide.BUY);
      expect(result[0].symbol).toBe("PERP_ETH_USDC");
    });

    it("should filter sell orders by symbol", () => {
      const result = sellOrdersFilter_by_symbol(mockOrders, "PERP_ETH_USDC");
      expect(result).toHaveLength(1);
      expect(result[0].side).toBe(OrderSide.SELL);
      expect(result[0].symbol).toBe("PERP_ETH_USDC");
    });
  });

  describe("getQtyFromPositions", () => {
    it("should get quantity from positions", () => {
      const positions: API.Position[] = [
        { symbol: "PERP_ETH_USDC", position_qty: 10 },
        { symbol: "PERP_BTC_USDC", position_qty: 5 },
      ] as API.Position[];

      const result = getQtyFromPositions(positions, "PERP_ETH_USDC");
      expect(result).toBe(10);
    });

    it("should return 0 if positions array is null", () => {
      const result = getQtyFromPositions(null as any, "PERP_ETH_USDC");
      expect(result).toBe(0);
    });

    it("should return 0 if symbol not found", () => {
      const positions: API.Position[] = [
        { symbol: "PERP_ETH_USDC", position_qty: 10 },
      ] as API.Position[];

      const result = getQtyFromPositions(positions, "PERP_BTC_USDC");
      expect(result).toBe(0);
    });
  });

  describe("getQtyFromOrdersBySide", () => {
    const mockOrders: API.Order[] = [
      { symbol: "PERP_ETH_USDC", side: OrderSide.BUY, quantity: 10 },
      { symbol: "PERP_ETH_USDC", side: OrderSide.BUY, quantity: 5 },
      { symbol: "PERP_ETH_USDC", side: OrderSide.SELL, quantity: 3 },
    ] as API.Order[];

    it("should get buy orders quantity", () => {
      const result = getQtyFromOrdersBySide(
        mockOrders,
        "PERP_ETH_USDC",
        OrderSide.BUY,
      );
      expect(result).toBe(15);
    });

    it("should get sell orders quantity", () => {
      const result = getQtyFromOrdersBySide(
        mockOrders,
        "PERP_ETH_USDC",
        OrderSide.SELL,
      );
      expect(result).toBe(3);
    });
  });

  describe("getPositonsAndOrdersNotionalBySymbol", () => {
    it("should calculate total notional for positions and orders", () => {
      const inputs = {
        positions: [
          { symbol: "PERP_ETH_USDC", position_qty: 10 },
        ] as API.Position[],
        orders: [
          { symbol: "PERP_ETH_USDC", side: OrderSide.BUY, quantity: 5 },
          { symbol: "PERP_ETH_USDC", side: OrderSide.SELL, quantity: 3 },
        ] as API.Order[],
        symbol: "PERP_ETH_USDC",
        markPrice: 100,
      };

      const result = getPositonsAndOrdersNotionalBySymbol(inputs);
      const expected = 100 * (10 + 5 + 3);
      expect(result).toBe(expected);
    });
  });

  describe("groupOrdersBySymbol", () => {
    it("should group orders by symbol", () => {
      const orders: API.Order[] = [
        { symbol: "PERP_ETH_USDC", side: OrderSide.BUY },
        { symbol: "PERP_BTC_USDC", side: OrderSide.BUY },
        { symbol: "PERP_ETH_USDC", side: OrderSide.SELL },
      ] as API.Order[];

      const result = groupOrdersBySymbol(orders);
      expect(result).toHaveProperty("PERP_ETH_USDC");
      expect(result).toHaveProperty("PERP_BTC_USDC");
      expect(result["PERP_ETH_USDC"]).toHaveLength(2);
      expect(result["PERP_BTC_USDC"]).toHaveLength(1);
    });
  });

  describe("extractSymbols", () => {
    it("should extract unique symbols from positions and orders", () => {
      const positions = [
        { symbol: "PERP_ETH_USDC" },
        { symbol: "PERP_BTC_USDC" },
      ] as API.Position[];

      const orders = [
        { symbol: "PERP_ETH_USDC" },
        { symbol: "PERP_SOL_USDC" },
      ] as API.Order[];

      const result = extractSymbols(positions, orders);
      expect(result).toContain("PERP_ETH_USDC");
      expect(result).toContain("PERP_BTC_USDC");
      expect(result).toContain("PERP_SOL_USDC");
      expect(result).toHaveLength(3);
    });
  });

  describe("maxQty functions", () => {
    const commonInputs = {
      symbol: "PERP_ETH_USDC",
      baseMaxQty: 1000,
      totalCollateral: 10000,
      maxLeverage: 10,
      baseIMR: 0.05,
      otherIMs: 100,
      markPrice: 100,
      positionQty: 0,
      buyOrdersQty: 0,
      sellOrdersQty: 0,
      IMR_Factor: 0.002,
      takerFeeRate: 0.001,
    };

    it("should call maxQtyByLong for BUY side", () => {
      const result = maxQty(OrderSide.BUY, commonInputs);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(commonInputs.baseMaxQty);
    });

    it("should call maxQtyByShort for SELL side", () => {
      const result = maxQty(OrderSide.SELL, commonInputs);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(commonInputs.baseMaxQty);
    });

    it("should return 0 when total collateral is 0 for long", () => {
      const inputs = { ...commonInputs, totalCollateral: 0 };
      const result = maxQtyByLong(inputs);
      expect(result).toBe(0);
    });

    it("should handle errors and return 0", () => {
      const inputs = { ...commonInputs, markPrice: NaN };
      const result = maxQtyByLong(inputs);
      expect(result).toBe(0);
    });
  });

  describe("totalMarginRatio", () => {
    it("should calculate total margin ratio", () => {
      const inputs = {
        totalCollateral: 1000,
        markPrices: { PERP_ETH_USDC: 100 },
        positions: [
          { symbol: "PERP_ETH_USDC", position_qty: 5 },
        ] as API.Position[],
      };

      const result = totalMarginRatio(inputs);
      const expected = 1000 / (5 * 100);
      expect(result).toBeCloseTo(expected, 2);
    });

    it("should return 0 when total collateral is 0", () => {
      const inputs = {
        totalCollateral: 0,
        markPrices: {},
        positions: [],
      };

      const result = totalMarginRatio(inputs);
      expect(result).toBe(0);
    });

    it("should return 0 when total position notional is 0", () => {
      const inputs = {
        totalCollateral: 1000,
        markPrices: { PERP_ETH_USDC: 100 },
        positions: [
          { symbol: "PERP_ETH_USDC", position_qty: 0 },
        ] as API.Position[],
      };

      const result = totalMarginRatio(inputs);
      expect(result).toBe(0);
    });
  });

  describe("totalUnrealizedROI", () => {
    it("should calculate total unrealized ROI", () => {
      const inputs = {
        totalUnrealizedPnL: 100,
        totalValue: 1000,
      };

      const result = totalUnrealizedROI(inputs);
      expect(result).toBeCloseTo(100 / (1000 - 100), 2);
    });
  });

  describe("currentLeverage", () => {
    it("should calculate current leverage", () => {
      const result = currentLeverage(0.1);
      expect(result).toBe(10);
    });

    it("should return 0 when total margin ratio is 0", () => {
      const result = currentLeverage(0);
      expect(result).toBe(0);
    });
  });

  describe("availableBalance", () => {
    it("should calculate available balance", () => {
      const inputs = {
        USDCHolding: 1000,
        unsettlementPnL: 100,
      };

      const result = availableBalance(inputs);
      expect(result).toBe(1100);
    });
  });

  describe("MMR", () => {
    it("should calculate maintenance margin ratio", () => {
      const inputs = {
        positionsMMR: 100,
        positionsNotional: 1000,
      };

      const result = MMR(inputs);
      expect(result).toBe(0.1);
    });

    it("should return null when positions notional is 0", () => {
      const inputs = {
        positionsMMR: 0,
        positionsNotional: 0,
      };

      const result = MMR(inputs);
      expect(result).toBeNull();
    });
  });

  describe("collateralRatio", () => {
    it("should calculate collateral ratio", () => {
      const params = {
        baseWeight: 0.8,
        discountFactor: 0.1,
        collateralQty: 100,
        collateralCap: 200,
        indexPrice: 50,
      };

      const result = collateralRatio(params);
      expect(result).toBeInstanceOf(Decimal);
    });

    it("should use collateralQty when cap is -1", () => {
      const params = {
        baseWeight: 0.8,
        discountFactor: null,
        collateralQty: 100,
        collateralCap: -1,
        indexPrice: 50,
      };

      const result = collateralRatio(params);
      expect(result).toBeInstanceOf(Decimal);
    });
  });

  describe("collateralContribution", () => {
    it("should calculate collateral contribution", () => {
      const params = {
        collateralQty: 100,
        collateralCap: 200,
        collateralRatio: 0.8,
        indexPrice: 50,
      };

      const result = collateralContribution(params);
      expect(result).toBe(100 * 0.8 * 50);
    });

    it("should use collateralQty when cap is -1", () => {
      const params = {
        collateralQty: 100,
        collateralCap: -1,
        collateralRatio: 0.8,
        indexPrice: 50,
      };

      const result = collateralContribution(params);
      expect(result).toBe(100 * 0.8 * 50);
    });
  });

  describe("LTV", () => {
    it("should calculate LTV", () => {
      const params = {
        usdcBalance: 1000,
        upnl: 100,
        assets: [{ qty: 10, indexPrice: 50, weight: 0.8 }],
      };

      const result = LTV(params);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1);
    });

    it("should return 0 when numerator or denominator is 0", () => {
      const params = {
        usdcBalance: 0,
        upnl: 0,
        assets: [],
      };

      const result = LTV(params);
      expect(result).toBe(0);
    });
  });

  describe("maxWithdrawalUSDC", () => {
    it("should calculate max withdrawal USDC", () => {
      const inputs = {
        USDCBalance: 1000,
        freeCollateral: new Decimal(800),
        upnl: 100,
      };

      const result = maxWithdrawalUSDC(inputs);
      expect(result).toBe(Math.max(0, Math.min(1000, 800 - 100)));
    });

    it("should return 0 if calculation is negative", () => {
      const inputs = {
        USDCBalance: 100,
        freeCollateral: new Decimal(50),
        upnl: 100,
      };

      const result = maxWithdrawalUSDC(inputs);
      expect(result).toBe(0);
    });
  });

  describe("maxWithdrawalOtherCollateral", () => {
    it("should calculate max withdrawal for other collateral", () => {
      const inputs = {
        USDCBalance: 1000,
        collateralQty: 100,
        freeCollateral: new Decimal(800),
        indexPrice: 50,
        weight: new Decimal(0.8),
      };

      const result = maxWithdrawalOtherCollateral(inputs);
      expect(result).toBeInstanceOf(Decimal);
    });

    it("should return zero when denominator is zero", () => {
      const inputs = {
        USDCBalance: 1000,
        collateralQty: 100,
        freeCollateral: new Decimal(800),
        indexPrice: 0,
        weight: new Decimal(0.8),
      };

      const result = maxWithdrawalOtherCollateral(inputs);
      expect(result).toBe(zero);
    });
  });

  describe("calcMinimumReceived", () => {
    it("should calculate minimum received amount", () => {
      const inputs = {
        amount: 1000,
        slippage: 1,
      };

      const result = calcMinimumReceived(inputs);
      expect(result).toBeCloseTo(990, 2);
    });

    it("should handle 0 slippage", () => {
      const inputs = {
        amount: 1000,
        slippage: 0,
      };

      const result = calcMinimumReceived(inputs);
      expect(result).toBe(1000);
    });
  });

  describe("maxLeverage (deprecated)", () => {
    it("should return symbol leverage if provided", () => {
      const inputs = {
        symbolLeverage: 20,
        accountLeverage: 10,
      };

      const result = maxLeverage(inputs);
      expect(result).toBe(20);
    });

    it("should return 1 if symbol leverage is not provided", () => {
      const inputs = {
        accountLeverage: 10,
      };

      const result = maxLeverage(inputs);
      expect(result).toBe(1);
    });
  });
});
