import { describe, it, expect } from "@jest/globals";
import { version, positions, account, orderUtils, order } from "../index";

describe("Index Module", () => {
  describe("exports", () => {
    it("should export version", () => {
      expect(version).toBeDefined();
    });

    it("should export positions module", () => {
      expect(positions).toBeDefined();
    });

    it("should export account module", () => {
      expect(account).toBeDefined();
    });

    it("should export orderUtils module", () => {
      expect(orderUtils).toBeDefined();
    });

    it("should export order module", () => {
      expect(order).toBeDefined();
    });

    it("should export positions functions", () => {
      expect(positions.notional).toBeDefined();
      expect(positions.totalNotional).toBeDefined();
      expect(positions.unrealizedPnL).toBeDefined();
      expect(positions.unrealizedPnLROI).toBeDefined();
      expect(positions.totalUnrealizedPnL).toBeDefined();
      expect(positions.liqPrice).toBeDefined();
      expect(positions.maintenanceMargin).toBeDefined();
      expect(positions.unsettlementPnL).toBeDefined();
      expect(positions.totalUnsettlementPnL).toBeDefined();
      expect(positions.MMR).toBeDefined();
      expect(positions.estPnLForTP).toBeDefined();
      expect(positions.estPriceForTP).toBeDefined();
      expect(positions.estOffsetForTP).toBeDefined();
      expect(positions.estPriceFromOffsetForTP).toBeDefined();
      expect(positions.estPnLForSL).toBeDefined();
      expect(positions.maxPositionNotional).toBeDefined();
      expect(positions.maxPositionLeverage).toBeDefined();
    });

    it("should export account functions", () => {
      expect(account.totalValue).toBeDefined();
      expect(account.freeCollateral).toBeDefined();
      expect(account.totalCollateral).toBeDefined();
      expect(account.positionNotionalWithOrder_by_symbol).toBeDefined();
      expect(account.positionQtyWithOrders_by_symbol).toBeDefined();
      expect(account.IMR).toBeDefined();
      expect(account.buyOrdersFilter_by_symbol).toBeDefined();
      expect(account.sellOrdersFilter_by_symbol).toBeDefined();
      expect(account.getQtyFromPositions).toBeDefined();
      expect(account.getQtyFromOrdersBySide).toBeDefined();
      expect(account.getPositonsAndOrdersNotionalBySymbol).toBeDefined();
      expect(account.totalInitialMarginWithOrders).toBeDefined();
      expect(account.totalInitialMarginWithQty).toBeDefined();
      expect(account.groupOrdersBySymbol).toBeDefined();
      expect(account.extractSymbols).toBeDefined();
      expect(account.otherIMs).toBeDefined();
      expect(account.maxQty).toBeDefined();
      expect(account.maxQtyByLong).toBeDefined();
      expect(account.maxQtyByShort).toBeDefined();
      expect(account.totalMarginRatio).toBeDefined();
      expect(account.totalUnrealizedROI).toBeDefined();
      expect(account.currentLeverage).toBeDefined();
      expect(account.availableBalance).toBeDefined();
      expect(account.MMR).toBeDefined();
      expect(account.collateralRatio).toBeDefined();
      expect(account.collateralContribution).toBeDefined();
      expect(account.LTV).toBeDefined();
      expect(account.maxWithdrawalUSDC).toBeDefined();
      expect(account.maxWithdrawalOtherCollateral).toBeDefined();
      expect(account.calcMinimumReceived).toBeDefined();
      expect(account.maxLeverage).toBeDefined();
    });

    it("should export order functions", () => {
      expect(order.maxPrice).toBeDefined();
      expect(order.minPrice).toBeDefined();
      expect(order.scopePrice).toBeDefined();
      expect(order.orderFee).toBeDefined();
      expect(order.estLiqPrice).toBeDefined();
      expect(order.estLeverage).toBeDefined();
      expect(order.tpslROI).toBeDefined();
    });

    it("should export orderUtils as alias for order", () => {
      expect(orderUtils).toBe(order);
    });
  });
});
