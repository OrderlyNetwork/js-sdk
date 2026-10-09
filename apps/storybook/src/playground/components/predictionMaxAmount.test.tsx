import React from "react";
import { act, create } from "react-test-renderer";
import { expect, it } from "vitest";
import { usePredictionOrderForm } from "@orderly.network/prediction/src/prediction/hooks/usePredictionOrderForm";

it("empty limits estimate capacity from mark without pricing or enabling an order", () => {
  let state: ReturnType<typeof usePredictionOrderForm>;
  const Probe = ({ markPrice }: { markPrice?: number }) => {
    state = usePredictionOrderForm({
      marketId: "A",
      markPrice,
      executablePrices: {
        buy: { up: undefined, down: undefined },
        sell: { up: undefined, down: undefined },
      },
      marketPrice: () => undefined,
      balance: 100,
      estimateAdditionalFrozen: (_outcome, qty, price) => qty * price,
      maxOpeningQuantity: (_outcome, price) => Math.min(200, 100 / price),
      availableQuantity: () => 12,
      positions: [],
      isRoundTradable: true,
      isRegionRestricted: false,
      minNotional: 1,
    });
    return null;
  };
  let view: ReturnType<typeof create>;
  act(() => {
    view = create(<Probe markPrice={0.5} />);
  });
  // Empty market quotes must not fall back to a valuation price.
  expect(state!.hasMaxAmountEstimate).toBe(false);
  act(() => {
    state!.setTradeMode("limit");
  });
  expect(state!.maxAmountPrice).toBe(0.5);
  expect(state!.maxAmount).toBe(100);
  expect(state!.limitPrice).toBe("");
  expect(state!.selectedPrice).toBe(0);
  act(() => {
    state!.setOrderPercentage(100);
  });
  expect(state!.amount).toBe("100.00");
  expect(state!.orderQuantity).toBe(0);
  expect(state!.canPlaceOrder).toBe(false);
  act(() => {
    state!.setLimitPrice("0.25");
  });
  expect(state!.maxAmountPrice).toBe(0.25);
  expect(state!.maxAmount).toBe(50);
  expect(state!.selectedPrice).toBe(0.25);
  act(() => {
    state!.setLimitPrice("");
    view!.update(<Probe markPrice={0.63} />);
  });
  expect(state!.maxAmountPrice).toBe(0.63);
  act(() => {
    state!.setSelectedOutcome("down");
  });
  expect(state!.maxAmountPrice).toBe(0.37);
  act(() => {
    view!.update(<Probe />);
  });
  expect(state!.hasMaxAmountEstimate).toBe(false);
  expect(state!.maxAmount).toBe(0);
  act(() => {
    view!.update(<Probe markPrice={0} />);
  });
  expect(state!.hasMaxAmountEstimate).toBe(false);
  act(() => {
    view!.update(<Probe markPrice={0.5} />);
    state!.setLimitPrice("0");
  });
  expect(state!.hasMaxAmountEstimate).toBe(false);
  act(() => {
    state!.setOrderSide("sell");
  });
  expect(state!.maxAmount).toBe(12);
  expect(state!.hasMaxAmountEstimate).toBe(true);
  act(() => {
    view!.unmount();
  });
});
