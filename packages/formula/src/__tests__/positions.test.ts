import { describe, it, expect } from "@jest/globals";
import { API } from "@orderly.network/types";
import {
  notional,
  totalNotional,
  unrealizedPnL,
  unrealizedPnLROI,
  totalUnrealizedPnL,
  liqPrice,
  maintenanceMargin,
  unsettlementPnL,
  totalUnsettlementPnL,
  MMR,
  estPnLForTP,
  estPriceForTP,
  estOffsetForTP,
  estPriceFromOffsetForTP,
  estPnLForSL,
  maxPositionNotional,
  maxPositionLeverage,
} from "../positions";

describe("Positions Functions", () => {
  describe("notional", () => {
    it("should calculate notional value correctly", () => {
      const qty = 10;
      const mark_price = 100;
      const result = notional(qty, mark_price);
      expect(result).toBe(1000);
    });

    it("should return absolute value", () => {
      const qty = -10;
      const mark_price = 100;
      const result = notional(qty, mark_price);
      expect(result).toBe(1000);
    });

    it("should handle zero quantity", () => {
      const qty = 0;
      const mark_price = 100;
      const result = notional(qty, mark_price);
      expect(result).toBe(0);
    });
  });

  describe("totalNotional", () => {
    it("should calculate total notional for all positions", () => {
      const positions: API.Position[] = [
        { symbol: "PERP_ETH_USDC", position_qty: 10, mark_price: 100 },
        { symbol: "PERP_BTC_USDC", position_qty: 5, mark_price: 200 },
      ] as API.Position[];

      const result = totalNotional(positions);
      expect(result).toBe(10 * 100 + 5 * 200);
    });

    it("should handle empty positions array", () => {
      const positions: API.Position[] = [];
      const result = totalNotional(positions);
      expect(result).toBe(0);
    });

    it("should handle negative quantities", () => {
      const positions: API.Position[] = [
        { symbol: "PERP_ETH_USDC", position_qty: -10, mark_price: 100 },
        { symbol: "PERP_BTC_USDC", position_qty: 5, mark_price: 200 },
      ] as API.Position[];

      const result = totalNotional(positions);
      expect(result).toBe(10 * 100 + 5 * 200);
    });
  });

  describe("unrealizedPnL", () => {
    it("should calculate unrealized PnL correctly for long position", () => {
      const inputs = {
        markPrice: 110,
        openPrice: 100,
        qty: 10,
      };

      const result = unrealizedPnL(inputs);
      expect(result).toBe(100); // 10 * (110 - 100)
    });

    it("should calculate unrealized PnL correctly for short position", () => {
      const inputs = {
        markPrice: 90,
        openPrice: 100,
        qty: -10,
      };

      const result = unrealizedPnL(inputs);
      expect(result).toBe(100); // -10 * (90 - 100) = 100
    });

    it("should handle zero quantity", () => {
      const inputs = {
        markPrice: 110,
        openPrice: 100,
        qty: 0,
      };

      const result = unrealizedPnL(inputs);
      expect(result).toBe(0);
    });
  });

  describe("unrealizedPnLROI", () => {
    it("should calculate ROI correctly", () => {
      const inputs = {
        positionQty: 10,
        openPrice: 100,
        IMR: 0.1,
        unrealizedPnL: 100,
      };

      const result = unrealizedPnLROI(inputs);
      expect(result).toBeCloseTo(1, 2); // 100 / (10 * 100 * 0.1) = 1
    });

    it("should return 0 when unrealized PnL is 0", () => {
      const inputs = {
        positionQty: 10,
        openPrice: 100,
        IMR: 0.1,
        unrealizedPnL: 0,
      };

      const result = unrealizedPnLROI(inputs);
      expect(result).toBe(0);
    });

    it("should return 0 when position quantity is 0", () => {
      const inputs = {
        positionQty: 0,
        openPrice: 100,
        IMR: 0.1,
        unrealizedPnL: 100,
      };

      const result = unrealizedPnLROI(inputs);
      expect(result).toBe(0);
    });

    it("should return 0 when open price is 0", () => {
      const inputs = {
        positionQty: 10,
        openPrice: 0,
        IMR: 0.1,
        unrealizedPnL: 100,
      };

      const result = unrealizedPnLROI(inputs);
      expect(result).toBe(0);
    });

    it("should return 0 when IMR is 0", () => {
      const inputs = {
        positionQty: 10,
        openPrice: 100,
        IMR: 0,
        unrealizedPnL: 100,
      };

      const result = unrealizedPnLROI(inputs);
      expect(result).toBe(0);
    });
  });

  describe("totalUnrealizedPnL", () => {
    it("should calculate total unrealized PnL for all positions", () => {
      const positions: API.Position[] = [
        {
          symbol: "PERP_ETH_USDC",
          position_qty: 10,
          mark_price: 110,
          average_open_price: 100,
        },
        {
          symbol: "PERP_BTC_USDC",
          position_qty: -5,
          mark_price: 90,
          average_open_price: 100,
        },
      ] as API.Position[];

      const result = totalUnrealizedPnL(positions);
      expect(result).toBe(100 + 50); // 10*(110-100) + -5*(90-100)
    });

    it("should handle empty positions array", () => {
      const positions: API.Position[] = [];
      const result = totalUnrealizedPnL(positions);
      expect(result).toBe(0);
    });
  });

  describe("liqPrice", () => {
    const mockPositions: Array<
      Pick<API.PositionExt, "position_qty" | "mark_price" | "mmr">
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

    it("should calculate liquidation price correctly", () => {
      const inputs = {
        markPrice: 100,
        totalCollateral: 2000,
        positionQty: 10,
        positions: mockPositions,
        MMR: 0.05,
      };

      const result = liqPrice(inputs);
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should return null when position quantity is 0", () => {
      const inputs = {
        markPrice: 100,
        totalCollateral: 2000,
        positionQty: 0,
        positions: mockPositions,
        MMR: 0.05,
      };

      const result = liqPrice(inputs);
      expect(result).toBeNull();
    });

    it("should return null when total collateral is 0", () => {
      const inputs = {
        markPrice: 100,
        totalCollateral: 0,
        positionQty: 10,
        positions: mockPositions,
        MMR: 0.05,
      };

      const result = liqPrice(inputs);
      expect(result).toBeNull();
    });

    it("should return max(0, calculated price)", () => {
      const inputs = {
        markPrice: 100,
        totalCollateral: 10, // Very low collateral
        positionQty: 10,
        positions: [
          {
            symbol: "PERP_ETH_USDC",
            position_qty: 10,
            mark_price: 100,
            mmr: 0.5, // High MMR
          },
        ],
        MMR: 0.5,
      };

      const result = liqPrice(inputs);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  describe("maintenanceMargin", () => {
    it("should calculate maintenance margin correctly", () => {
      const inputs = {
        positionQty: 10,
        markPrice: 100,
        MMR: 0.05,
      };

      const result = maintenanceMargin(inputs);
      expect(result).toBe(50); // 10 * 100 * 0.05
    });

    it("should return absolute value", () => {
      const inputs = {
        positionQty: -10,
        markPrice: 100,
        MMR: 0.05,
      };

      const result = maintenanceMargin(inputs);
      expect(result).toBe(50); // abs(-10 * 100 * 0.05)
    });
  });

  describe("unsettlementPnL", () => {
    it("should calculate unsettlement PnL correctly", () => {
      const inputs = {
        positionQty: 10,
        markPrice: 110,
        costPosition: 1000,
        sumUnitaryFunding: 1.1,
        lastSumUnitaryFunding: 1.0,
      };

      const result = unsettlementPnL(inputs);
      expect(result).toBeCloseTo(99, 2); // 10*110 - 1000 - 10*(1.1-1.0) = 1100 - 1000 - 1 = 99
    });

    it("should handle zero position quantity", () => {
      const inputs = {
        positionQty: 0,
        markPrice: 110,
        costPosition: 1000,
        sumUnitaryFunding: 1.1,
        lastSumUnitaryFunding: 1.0,
      };

      const result = unsettlementPnL(inputs);
      expect(result).toBeCloseTo(-1000, 2);
    });
  });

  describe("totalUnsettlementPnL", () => {
    it("should calculate total unsettlement PnL for all positions", () => {
      const positions = [
        {
          symbol: "PERP_ETH_USDC",
          position_qty: 10,
          mark_price: 110,
          cost_position: 1000,
          sum_unitary_funding: 1.1,
          last_sum_unitary_funding: 1.0,
        },
        {
          symbol: "PERP_BTC_USDC",
          position_qty: 5,
          mark_price: 210,
          cost_position: 1000,
          sum_unitary_funding: 1.2,
          last_sum_unitary_funding: 1.0,
        },
      ] as any[];

      const result = totalUnsettlementPnL(positions);
      expect(result).toBeCloseTo(99 + 49, 2);
    });

    it("should handle empty positions array", () => {
      const positions: any[] = [];
      const result = totalUnsettlementPnL(positions);
      expect(result).toBe(0);
    });

    it("should handle null or undefined positions", () => {
      const result = totalUnsettlementPnL(null as any);
      expect(result).toBe(0);
    });

    it("should handle non-array input", () => {
      const result = totalUnsettlementPnL("not an array" as any);
      expect(result).toBe(0);
    });
  });

  describe("MMR", () => {
    it("should calculate MMR correctly", () => {
      const inputs = {
        baseMMR: 0.02,
        baseIMR: 0.05,
        IMRFactor: 0.002,
        positionNotional: 10000,
        IMR_factor_power: 0.8,
      };

      const result = MMR(inputs);
      expect(result).toBeGreaterThanOrEqual(0.02); // baseMMR
    });

    it("should use default IMR_factor_power", () => {
      const inputs = {
        baseMMR: 0.02,
        baseIMR: 0.05,
        IMRFactor: 0.002,
        positionNotional: 10000,
      };

      const result1 = MMR(inputs);
      const result2 = MMR({ ...inputs, IMR_factor_power: 0.8 });
      expect(result1).toBe(result2);
    });
  });

  describe("Take Profit functions", () => {
    describe("estPnLForTP", () => {
      it("should estimate PnL for take profit correctly", () => {
        const inputs = {
          positionQty: 10,
          entryPrice: 100,
          price: 110,
        };

        const result = estPnLForTP(inputs);
        expect(result).toBe(100); // 10 * (110 - 100)
      });

      it("should handle negative position quantity", () => {
        const inputs = {
          positionQty: -10,
          entryPrice: 100,
          price: 90,
        };

        const result = estPnLForTP(inputs);
        expect(result).toBeCloseTo(100, 2); // -10 * (90 - 100) = 100
      });
    });

    describe("estPriceForTP", () => {
      it("should estimate price for take profit correctly", () => {
        const inputs = {
          positionQty: 10,
          entryPrice: 100,
          pnl: 100,
        };

        const result = estPriceForTP(inputs);
        expect(result).toBeCloseTo(20, 2); // (100 + 100) / 10
      });
    });

    describe("estOffsetForTP", () => {
      it("should estimate offset for take profit correctly", () => {
        const inputs = {
          price: 110,
          entryPrice: 100,
        };

        const result = estOffsetForTP(inputs);
        expect(result).toBeCloseTo(1.1, 2); // 110 / 100
      });
    });

    describe("estPriceFromOffsetForTP", () => {
      it("should estimate price from offset for take profit correctly", () => {
        const inputs = {
          offset: 1.1,
          entryPrice: 100,
        };

        const result = estPriceFromOffsetForTP(inputs);
        expect(result).toBeCloseTo(101.1, 2); // 1.1 + 100
      });
    });
  });

  describe("estPnLForSL", () => {
    it("should return 0 for stop loss PnL (placeholder)", () => {
      const inputs = {
        positionQty: 10,
        entryPrice: 100,
      };

      const result = estPnLForSL(inputs);
      expect(result).toBe(0);
    });
  });

  describe("maxPositionNotional", () => {
    it("should calculate max position notional correctly", () => {
      const inputs = {
        leverage: 10,
        IMRFactor: 0.002,
      };

      const result = maxPositionNotional(inputs);
      expect(result).toBeGreaterThan(0);
    });

    it("should handle edge case with zero leverage", () => {
      const inputs = {
        leverage: 0,
        IMRFactor: 0.002,
      };

      expect(() => maxPositionNotional(inputs)).toThrow();
    });

    it("should handle edge case with zero IMR factor", () => {
      const inputs = {
        leverage: 10,
        IMRFactor: 0,
      };

      expect(() => maxPositionNotional(inputs)).toThrow();
    });
  });

  describe("maxPositionLeverage", () => {
    it("should calculate max position leverage correctly", () => {
      const inputs = {
        IMRFactor: 0.002,
        notional: 10000,
      };

      const result = maxPositionLeverage(inputs);
      expect(result).toBeGreaterThan(0);
    });

    it("should handle edge case with zero IMR factor", () => {
      const inputs = {
        IMRFactor: 0,
        notional: 10000,
      };

      expect(() => maxPositionLeverage(inputs)).toThrow();
    });

    it("should handle zero notional", () => {
      const inputs = {
        IMRFactor: 0.002,
        notional: 0,
      };

      expect(() => maxPositionLeverage(inputs)).toThrow();
    });
  });
});
