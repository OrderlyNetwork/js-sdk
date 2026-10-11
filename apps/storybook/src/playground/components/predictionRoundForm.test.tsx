import { useEffect } from "react";
import { act, create } from "react-test-renderer";
import { expect, it } from "vitest";
import { usePredictionOrderForm } from "@orderly.network/prediction/src/prediction/hooks/usePredictionOrderForm";

it("retains inputs for the accepted symbol and clears them only when another round is accepted", () => {
  let state: ReturnType<typeof usePredictionOrderForm>;
  function Probe({ symbol }: { symbol: string }) {
    const form = usePredictionOrderForm({
      marketId: "PERP_BTC5M_USDC",
      symbol,
      executablePrices: {
        buy: { up: 0.5, down: 0.5 },
        sell: { up: 0.5, down: 0.5 },
      },
      marketPrice: () => 0.5,
      balance: 100,
      estimateAdditionalFrozen: (_outcome, quantity, price) => quantity * price,
      maxOpeningQuantity: () => 200,
      availableQuantity: () => 12,
      positions: [],
      isRoundTradable: true,
      isRegionRestricted: false,
    });
    useEffect(() => {
      state = form;
    }, [form]);
    return null;
  }
  const first = "PERP_BTC5M2609291035_USDC";
  let root: ReturnType<typeof create>;
  act(() => {
    root = create(<Probe symbol={first} />);
  });
  act(() => {
    state!.setTradeMode("limit");
    state!.setSelectedOutcome("down");
  });
  act(() => state!.setLimitPrice("0.4"));
  act(() => state!.setOrderPercentage(50));
  const amount = state!.amount;
  act(() => root!.update(<Probe symbol={first} />));
  expect(state!.amount).toBe(amount);
  expect(state!.limitPrice).toBe("0.4");
  expect(state!.orderPercentage).toBeGreaterThan(0);
  act(() => root!.update(<Probe symbol="PERP_BTC5M2609291040_USDC" />));
  expect(state!.amount).toBe("");
  expect(state!.limitPrice).toBe("");
  expect(state!.orderPercentage).toBe(0);
  expect(state!.selectedOutcome).toBe("down");
  expect(state!.tradeMode).toBe("limit");
  expect(state!.canPlaceOrder).toBe(false);
  act(() => root!.unmount());
});

it("reports the minimum notional for the screenshot order", () => {
  let state: ReturnType<typeof usePredictionOrderForm>;
  function Probe() {
    state = usePredictionOrderForm({
      marketId: "PERP_BTC5M_USDC",
      symbol: "PERP_BTC5M2609291035_USDC",
      executablePrices: {
        buy: { up: 0.29, down: 0.73 },
        sell: { up: 0.27, down: 0.71 },
      },
      marketPrice: () => 0.29,
      balance: 100,
      estimateAdditionalFrozen: (_outcome, quantity, price) => quantity * price,
      maxOpeningQuantity: () => 300,
      availableQuantity: () => 100,
      positions: [],
      isRoundTradable: true,
      isRegionRestricted: false,
    });
    return null;
  }
  let root: ReturnType<typeof create>;
  act(() => {
    root = create(<Probe />);
  });
  act(() => {
    state!.setTradeMode("limit");
    state!.setAmount("1.88");
  });
  expect(state!.orderQuantity).toBe(6.48);
  expect(state!.canPlaceOrder).toBe(false);
  expect(state!.orderValidationError).toEqual({
    field: "total",
    key: "orderEntry.total.error.min",
    value: 5,
  });
  act(() => state!.setAmount("5.01"));
  expect(state!.canPlaceOrder).toBe(true);
  expect(state!.orderValidationError).toBeUndefined();
  act(() => root!.unmount());
});
