import { describe, expect, it } from "@jest/globals";
import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import * as account from "../src/account";

describe("account formula", () => {
  describe("totalCollateral", () => {
    const collateral = (overrides: Record<string, unknown> = {}) => ({
      holding: 100,
      pendingShort: 0,
      indexPrice: 1,
      collateralCap: -1,
      collateralRatio: new Decimal(0.9),
      isCollateral: true,
      ...overrides,
    });

    it("should include eligible non-USDC collateral when USDC is zero", () => {
      const result = account.totalCollateral({
        USDCHolding: 0,
        nonUSDCHolding: [collateral()],
        unsettlementPnL: 0,
      });

      expect(result.toNumber()).toBe(90);
    });

    it("should exclude positive assets that are not collateral", () => {
      const result = account.totalCollateral({
        USDCHolding: 0,
        nonUSDCHolding: [collateral({ isCollateral: false })],
        unsettlementPnL: 0,
      });

      expect(result.toNumber()).toBe(0);
    });

    it("should include signed pending sells in the effective quantity", () => {
      const result = account.totalCollateral({
        USDCHolding: 0,
        nonUSDCHolding: [collateral({ pendingShort: -20 })],
        unsettlementPnL: 0,
      });

      expect(result.toNumber()).toBe(72);
    });

    it("should value negative assets as full debt without cap or discount", () => {
      const result = account.totalCollateral({
        USDCHolding: 100,
        nonUSDCHolding: [
          collateral({
            holding: 10,
            pendingShort: -20,
            indexPrice: 2,
            collateralCap: 1,
            collateralRatio: new Decimal(0.5),
          }),
        ],
        unsettlementPnL: 0,
      });

      expect(result.toNumber()).toBe(80);
    });

    it("should fail closed when non-USDC debt has no valid index price", () => {
      const result = account.totalCollateral({
        USDCHolding: 100,
        nonUSDCHolding: [
          collateral({ holding: -10, indexPrice: 0, isCollateral: false }),
        ],
        unsettlementPnL: 0,
      });

      expect(result.toNumber()).toBe(0);
    });

    it("should treat a collateral cap of -1 as unlimited", () => {
      const result = account.totalCollateral({
        USDCHolding: 0,
        nonUSDCHolding: [
          collateral({
            holding: 10,
            indexPrice: 2,
            collateralRatio: new Decimal(0.8),
          }),
        ],
        unsettlementPnL: 0,
      });

      expect(result.toNumber()).toBe(16);
    });

    it("should subtract pending USDC and isolated order frozen margin", () => {
      const result = account.totalCollateral({
        USDCHolding: 100,
        nonUSDCHolding: [],
        unsettlementPnL: 0,
        usdcBalancePendingShortQty: -5,
        usdcBalanceIsolatedOrderFrozen: 20,
      });

      expect(result.toNumber()).toBe(75);
    });
  });

  describe("freeCollateralUSDCOnly", () => {
    it("should preserve the legacy metric with an unlimited collateral cap", () => {
      const result = account.freeCollateralUSDCOnly({
        freeCollateral: new Decimal(90),
        nonUSDCHolding: [
          {
            holding: 100,
            indexPrice: 1,
            collateralCap: -1,
            collateralRatio: new Decimal(0.9),
            isCollateral: true,
          },
        ],
      });

      expect(result.toNumber()).toBe(0);
    });
  });

  describe("maxQtyForIsolatedMargin", () => {
    it("should reserve fee buffer and safety factor for same-direction orders", () => {
      const maxQty = account.maxQtyForIsolatedMargin({
        symbol: "PERP_BTC_USDC",
        orderSide: OrderSide.BUY,
        currentOrderReferencePrice: 50000,
        availableBalance: 100,
        leverage: 10,
        baseIMR: 0.1,
        IMR_Factor: 0.0000001,
        markPrice: 50000,
        positionQty: 0,
        pendingLongOrders: [],
        pendingSellOrders: [],
        isoOrderFrozenLong: 0,
        isoOrderFrozenShort: 0,
        symbolMaxNotional: 10000000,
      });

      expect(maxQty).toBeCloseTo(0.019781312127236578, 12);
    });

    it("should subtract existing frozen margin in flip binary search", () => {
      const maxQty = account.maxQtyForIsolatedMargin({
        symbol: "PERP_BTC_USDC",
        orderSide: OrderSide.BUY,
        currentOrderReferencePrice: 100,
        availableBalance: 100,
        leverage: 10,
        baseIMR: 0.1,
        IMR_Factor: 0.0000001,
        markPrice: 100,
        positionQty: -1,
        pendingLongOrders: [{ referencePrice: 100, quantity: 2 }],
        pendingSellOrders: [],
        isoOrderFrozenLong: 20.12,
        isoOrderFrozenShort: 0,
        symbolMaxNotional: 1000,
        epsilon: 0.000001,
      });

      expect(maxQty).toBeCloseTo(9.940357852882704, 6);
    });
  });
});
