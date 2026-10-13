import { useEffect, useLayoutEffect } from "react";
import { act, create } from "react-test-renderer";
import { expect, it } from "vitest";
import { usePredictionOrderForm } from "@orderly.network/prediction/src/prediction/hooks/usePredictionOrderForm";

function mountTotalForm(initialPrice = 0.31) {
  let state!: ReturnType<typeof usePredictionOrderForm>;
  const commits: Array<
    Pick<typeof state, "totalInput" | "amount" | "orderQuantity">
  > = [];
  function Probe({
    price = initialPrice,
    baseTick = 0.01,
  }: {
    price?: number;
    baseTick?: number;
  }) {
    const form = usePredictionOrderForm({
      marketId: "PERP_BTC5M_USDC",
      symbol: "PERP_BTC5M2609291035_USDC",
      baseTick,
      executablePrices: {
        buy: { up: price, down: price },
        sell: { up: price, down: price },
      },
      marketPrice: () => price,
      balance: 100,
      estimateAdditionalFrozen: (_outcome, quantity, price) => quantity * price,
      maxOpeningQuantity: () => 200,
      availableQuantity: () => 200,
      positions: [],
      isRoundTradable: true,
      isRegionRestricted: false,
    });
    // Capture committed state before the passive synchronization effect runs.
    useLayoutEffect(() => {
      state = form;
      commits.push({
        totalInput: form.totalInput,
        amount: form.amount,
        orderQuantity: form.orderQuantity,
      });
    });
    return null;
  }
  let root!: ReturnType<typeof create>;
  act(() => {
    root = create(<Probe />);
  });
  return {
    current: () => state,
    commits,
    update: (price: number, baseTick = 0.01) => {
      act(() => root.update(<Probe price={price} baseTick={baseTick} />));
    },
    unmount: () => {
      act(() => root.unmount());
    },
  };
}

it.each(["buy", "sell"] as const)(
  "commits a %s total draft and its amount together, including clearing the draft",
  (side) => {
    const view = mountTotalForm();
    try {
      act(() => {
        view.current().setTradeMode("market");
        view.current().setOrderSide(side);
      });
      act(() => view.current().setOrderPercentage(100));
      view.commits.length = 0;

      act(() => view.current().setTotal("10"));
      expect(view.commits[0]).toEqual({
        totalInput: "10",
        amount: side === "buy" ? "10" : "32.25",
        orderQuantity: 32.25,
      });
      expect(view.current().orderPercentage).toBeCloseTo(
        side === "buy" ? (10 / 62) * 100 : (32.25 / 200) * 100,
      );

      view.commits.length = 0;
      act(() => view.current().setTotal(""));
      expect(view.commits[0]).toEqual({
        totalInput: "",
        amount: "",
        orderQuantity: 0,
      });
      expect(view.current().canPlaceOrder).toBe(false);

      view.commits.length = 0;
      act(() => view.current().setTotal("0."));
      expect(view.commits[0]).toEqual({
        totalInput: "0.",
        amount: side === "buy" ? "0." : "",
        orderQuantity: 0,
      });
    } finally {
      view.unmount();
    }
  },
);

it("uses the current price, quantity tick and amount unit when writing a total", () => {
  const view = mountTotalForm();
  try {
    act(() => {
      view.current().setTradeMode("market");
      view.current().setOrderSide("sell");
    });
    act(() => view.current().setTotal("10"));
    view.update(0.6, 0.001);
    expect(view.current().amount).toBe("16.666");

    view.commits.length = 0;
    act(() => view.current().setTotal("12.01"));
    expect(view.commits[0]).toEqual({
      totalInput: "12.01",
      amount: "20.016",
      orderQuantity: 20.016,
    });

    act(() => view.current().setOrderSide("buy"));
    view.commits.length = 0;
    act(() => view.current().setTotal("12.01"));
    expect(view.commits[0]).toEqual({
      totalInput: "12.01",
      amount: "12.01",
      orderQuantity: 20.016,
    });
  } finally {
    view.unmount();
  }
});

it.each(["buy", "sell"] as const)(
  "preserves %s total sizing rules when no valid price is available",
  (side) => {
    const view = mountTotalForm(0);
    try {
      act(() => {
        view.current().setTradeMode("market");
        view.current().setOrderSide(side);
      });
      act(() => view.current().setAmount("5"));
      view.commits.length = 0;

      act(() => view.current().setTotal("10"));
      expect(view.commits[0]).toEqual({
        totalInput: "10",
        amount: side === "buy" ? "10" : "",
        orderQuantity: 0,
      });
      expect(view.current().canPlaceOrder).toBe(false);
    } finally {
      view.unmount();
    }
  },
);

it.each([
  { selection: "round", side: "buy" },
  { selection: "round", side: "sell" },
  { selection: "market", side: "buy" },
  { selection: "market", side: "sell" },
  { selection: "price", side: "buy" },
  { selection: "price", side: "sell" },
] as const)(
  "handles a $side total draft when the $selection changes with a different price",
  ({ selection, side }) => {
    let state!: ReturnType<typeof usePredictionOrderForm>;
    function Probe({ changed = false }: { changed?: boolean }) {
      const price = changed ? 0.6 : 0.5;
      state = usePredictionOrderForm({
        marketId:
          changed && selection === "market"
            ? "PERP_ETH5M_USDC"
            : "PERP_BTC5M_USDC",
        symbol:
          changed && selection === "round"
            ? "PERP_BTC5M2609291040_USDC"
            : "PERP_BTC5M2609291035_USDC",
        executablePrices: {
          buy: { up: price, down: price },
          sell: { up: price, down: price },
        },
        marketPrice: () => price,
        balance: 100,
        estimateAdditionalFrozen: (_outcome, quantity, price) =>
          quantity * price,
        maxOpeningQuantity: () => 200,
        availableQuantity: () => 100,
        positions: [],
        isRoundTradable: true,
        isRegionRestricted: false,
      });
      return null;
    }
    let root!: ReturnType<typeof create>;
    act(() => {
      root = create(<Probe />);
    });
    try {
      act(() => {
        state.setTradeMode("market");
        state.setOrderSide(side);
      });
      act(() => state.setTotal("10"));
      expect(state.orderQuantity).toBe(20);
      expect(state.canPlaceOrder).toBe(true);

      act(() => root.update(<Probe changed />));
      if (selection === "price") {
        expect(state.totalInput).toBe("10");
        expect(state.amount).toBe(side === "buy" ? "10" : "16.66");
        expect(state.orderQuantity).toBe(16.66);
        expect(state.canPlaceOrder).toBe(true);
      } else {
        expect(state.totalInput).toBeNull();
        expect(state.amount).toBe("");
        expect(state.orderQuantity).toBe(0);
        expect(state.canPlaceOrder).toBe(false);
      }
    } finally {
      act(() => root.unmount());
    }
  },
);

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
