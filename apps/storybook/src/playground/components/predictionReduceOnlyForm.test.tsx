import React from "react";
import { act, create } from "react-test-renderer";
import { expect, it } from "vitest";
import { usePredictionOrderForm } from "@orderly.network/prediction/src/prediction/hooks/usePredictionOrderForm";

it.each(
  (["up", "down"] as const).flatMap((outcome) =>
    (["market", "limit"] as const).map((type) => [outcome, type] as const),
  ),
)(
  "exempts small %s %s sells in the form and preserves other restrictions",
  (outcome, type) => {
    let state!: ReturnType<typeof usePredictionOrderForm>;
    const Probe = () => {
      state = usePredictionOrderForm({
        marketId: "A",
        executablePrices: {
          buy: { up: 0.36, down: 0.36 },
          sell: { up: 0.36, down: 0.36 },
        },
        marketPrice: () => 0.36,
        balance: 100,
        estimateAdditionalFrozen: () => 1,
        maxOpeningQuantity: () => 100,
        availableQuantity: () => 12.26,
        positions: [],
        isRoundTradable: true,
        isRegionRestricted: false,
        minNotional: 5,
      });
      return null;
    };
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<Probe />);
    });
    try {
      act(() => {
        state.setOrderSide("sell");
      });
      act(() => {
        state.setSelectedOutcome(outcome);
        state.setTradeMode(type);
      });
      act(() => {
        state.setLimitPrice("0.36");
        state.setAmount("12.26");
      });
      expect(state.canPlaceOrder).toBe(true);
      act(() => {
        state.setAmount("1");
      });
      expect(state.canPlaceOrder).toBe(true);
      act(() => {
        state.setAmount("13.26");
      });
      expect(state.orderValidationError?.key).toBe(
        "prediction.message.insufficientContracts",
      );
      act(() => {
        state.setAmount("0.001");
      });
      expect(state.canPlaceOrder).toBe(false);
      act(() => {
        state.setOrderSide("buy");
      });
      act(() => {
        state.setAmount("1");
      });
      expect(state.orderValidationError?.field).toBe("total");
      expect(state.canPlaceOrder).toBe(false);
    } finally {
      act(() => root.unmount());
    }
  },
);
