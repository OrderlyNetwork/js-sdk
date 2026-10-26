import { useLayoutEffect } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { useAccountEstimates } from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useAccountEstimates";
import {
  useOneTapOrders,
  type OneTapOrders,
  type OneTapOrdersArgs,
} from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useOneTapOrders";
import type { PredictionAccountResources } from "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountResources";

let root: ReactTestRenderer | undefined;
let state: OneTapOrders;
const input = (): OneTapOrdersArgs => ({
  protectionPrice: vi.fn((outcome) => (outcome === "up" ? 0.6 : 0.4)),
  isOrderTradable: vi.fn(() => true),
  estimateAdditionalFrozen: vi.fn(() => 10),
  submitOrder: vi.fn(async () => true),
  isSubmitting: false,
  book: {
    asks: [[0.6, 100]],
    bids: [[0.6, 100]],
    downAsks: [[0.4, 100]],
    downBids: [[0.4, 100]],
  },
  slippage: "2",
  notify: vi.fn(),
  selectedSymbol: "PERP_BTC5M2610091200_USDC",
  selectedConfig: undefined,
  balance: 100,
  accountReady: true,
  hasFeeConfig: true,
  isRegionRestricted: false,
  onActiveTab: vi.fn(),
});
function Consumer({ props }: { props: OneTapOrdersArgs }) {
  state = useOneTapOrders(props);
  return null;
}
function mount(props = input()) {
  act(() => {
    root = create(<Consumer props={props} />);
  });
  return props;
}
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it("previews the rounded tail quantity and submits its original sizing anchor", async () => {
  const props = mount({
    ...input(),
    protectionPrice: () => 0.99,
    selectedConfig: {
      base_tick: 0.01,
      base_max: 5,
      min_notional: 1,
    } as OneTapOrdersArgs["selectedConfig"],
    book: {
      asks: [[0.99, 100]],
      bids: [[0.99, 100]],
      downAsks: [],
      downBids: [],
    },
  });
  expect(state.evaluateOneTapOrder("up", 14.86)).toMatchObject({
    requestedQuantity: 15.01,
    quantity: 15,
    canPlace: true,
  });
  expect(props.estimateAdditionalFrozen).toHaveBeenCalledWith(
    "up",
    15.01,
    0.99,
  );
  await act(async () => state.placeOneTapOrder("up", 14.86, vi.fn()));
  expect(props.submitOrder).toHaveBeenCalledWith(
    expect.objectContaining({ quantity: 15.01 }),
  );
});

it.each(["up", "down"] as const)(
  "sizes %s once at protection price and submits the same tick-aligned estimate",
  async (outcome) => {
    const props = mount();
    const quantity = outcome === "up" ? 16.66 : 25;
    const displayPrice = outcome === "up" ? 0.6 : 0.4;
    expect(state.evaluateOneTapOrder(outcome, 10)).toEqual({
      displayPrice,
      quantity,
      requestedQuantity: quantity,
      requiredFrozen: 10,
      estimatedSlippage: 0,
      blockReason: undefined,
      canPlace: true,
    });
    expect(props.protectionPrice).toHaveBeenCalledTimes(1);
    expect(props.estimateAdditionalFrozen).toHaveBeenCalledTimes(1);
    expect(props.estimateAdditionalFrozen).toHaveBeenCalledWith(
      outcome,
      quantity,
      displayPrice,
    );
    const clear = vi.fn();
    await act(async () => state.placeOneTapOrder(outcome, 10, clear));
    expect(props.protectionPrice).toHaveBeenCalledTimes(2);
    expect(props.estimateAdditionalFrozen).toHaveBeenCalledTimes(2);
    expect(props.submitOrder).toHaveBeenCalledWith({
      symbol: props.selectedSymbol,
      outcome,
      side: "buy",
      type: "market",
      displayPrice,
      quantity,
      reduceOnly: false,
    });
    expect(clear).toHaveBeenCalledTimes(1);
    expect(props.onActiveTab).toHaveBeenCalledWith("predictions");
  },
);

it.each([
  [
    "missing quotes",
    { protectionPrice: () => undefined },
    10,
    "noExecutableQuotes",
  ],
  ["closed round", { isOrderTradable: () => false }, 10, "roundNotTradable"],
  ["region", { isRegionRestricted: true }, 10, "regionRestricted"],
  ["account", { accountReady: false }, 10, "orderFailed"],
  ["fees", { hasFeeConfig: false }, 10, "orderFailed"],
  [
    "unknown funding",
    { estimateAdditionalFrozen: () => undefined },
    10,
    "fundingUnavailable",
  ],
  [
    "NaN funding",
    { estimateAdditionalFrozen: () => NaN },
    10,
    "fundingUnavailable",
  ],
  [
    "infinite funding",
    { estimateAdditionalFrozen: () => Infinity },
    10,
    "fundingUnavailable",
  ],
  [
    "negative funding",
    { estimateAdditionalFrozen: () => -1 },
    10,
    "fundingUnavailable",
  ],
  ["funds", { balance: 9 }, 10, "insufficientBalance"],
  ["zero amount", {}, 0, "invalidOrder"],
  ["invalid amount", {}, NaN, "invalidOrder"],
  ["below one tick", {}, 0.001, "invalidOrder"],
  ["below UP notional", {}, 1, "belowMinimumNotional"],
] satisfies [string, Partial<OneTapOrdersArgs>, number, string][])(
  "uses the same rejection for the %s gate and submission",
  async (_label, overrides, amount, suffix) => {
    const props = mount({ ...input(), ...overrides });
    const reason =
      suffix === "invalidOrder"
        ? "prediction.invalidOrder"
        : `prediction.message.${suffix}`;
    expect(state.evaluateOneTapOrder("up", amount)).toMatchObject({
      blockReason: reason,
      canPlace: false,
    });
    const clear = vi.fn();
    await act(async () => state.placeOneTapOrder("up", amount, clear));
    expect(props.notify).toHaveBeenCalledWith(reason, "danger");
    expect(props.submitOrder).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
  },
);

it("checks DOWN min notional in UP coordinates", () => {
  const props = input();
  // 2.5 DOWN contracts cost 1 USDC, but their UP notional is 1.5 USDC.
  mount({
    ...props,
    selectedConfig: { min_notional: 1.4 } as OneTapOrdersArgs["selectedConfig"],
  });
  expect(state.evaluateOneTapOrder("down", 1).canPlace).toBe(true);
  act(() =>
    root!.update(
      <Consumer
        props={{
          ...props,
          selectedConfig: {
            min_notional: 1.6,
          } as OneTapOrdersArgs["selectedConfig"],
        }}
      />,
    ),
  );
  expect(state.evaluateOneTapOrder("down", 1).blockReason).toBe(
    "prediction.message.belowMinimumNotional",
  );
});

it("OR-7553 rejects rounded $5 below min notional before estimating real funding", async () => {
  const props = {
    ...input(),
    balance: 143455.19,
    protectionPrice: () => 0.58,
    selectedConfig: {
      base_tick: 0.01,
      min_notional: 5,
    } as OneTapOrdersArgs["selectedConfig"],
    book: { ...input().book, asks: [[0.58, 100]] as [number, number][] },
  };
  const getCollateralSnapshot = vi.fn(() => ({
    positionQty: 0,
    pendingBuyQty: 0,
    pendingSellQty: 0,
    orders: [],
    reservations: [],
    mode: "detailed" as const,
  }));
  let estimate: OneTapOrdersArgs["estimateAdditionalFrozen"];
  function FundingConsumer() {
    const estimates = useAccountEstimates({
      resources: {
        accountReady: true,
        balanceReady: true,
        balance: props.balance,
        availableQuantity: () => 0,
        getCollateralSnapshot,
      } as unknown as PredictionAccountResources,
      active: true,
      configBySymbol: new Map([[props.selectedSymbol!, props.selectedConfig!]]),
      selectedSymbol: props.selectedSymbol,
      feeRates: { makerBps: 0, takerBps: 6, makerRate: 0, takerRate: 0.0006 },
      hasFeeConfig: true,
    });
    const oneTap = useOneTapOrders({
      ...props,
      estimateAdditionalFrozen: estimates.estimateAdditionalFrozen,
    });
    useLayoutEffect(() => {
      estimate = estimates.estimateAdditionalFrozen;
      state = oneTap;
    });
    return null;
  }
  act(() => {
    root = create(<FundingConsumer />);
  });
  // This is the original undefined estimate that was misreported as insufficient funds.
  expect(estimate!("up", 8.62, 0.58)).toBeUndefined();
  getCollateralSnapshot.mockClear();
  expect(state.evaluateOneTapOrder("up", 5)).toMatchObject({
    quantity: 8.62,
    minimumOrder: {
      minQuantity: 8.63,
      minTotal: 5.01,
      value: 5,
      upPrice: 0.58,
    },
    requiredFrozen: undefined,
    blockReason: "prediction.message.belowMinimumNotional",
    canPlace: false,
  });
  expect(getCollateralSnapshot).not.toHaveBeenCalled();
  await act(async () => state.placeOneTapOrder("up", 5, vi.fn()));
  expect(props.notify).toHaveBeenCalledWith(
    "prediction.message.belowMinimumNotional",
    "danger",
  );
  expect(props.submitOrder).not.toHaveBeenCalled();
  expect(state.evaluateOneTapOrder("up", 10)).toMatchObject({
    quantity: 17.24,
    canPlace: true,
    blockReason: undefined,
  });
});

it.each([
  ["up", 0.58, 5, 8.63, 5.01, 0.58],
  ["up", 0.63, 5, 7.94, 5.01, 0.63],
  ["down", 0.4, 1, 8.34, 3.34, 0.6],
  ["down", 0.6, 1, 12.5, 7.5, 0.4],
] as const)(
  "calculates the %s minimum at protection price %s and updates it when the price changes",
  (outcome, price, amount, minQuantity, minTotal, upPrice) => {
    const props = mount({ ...input(), protectionPrice: () => price });
    expect(state.evaluateOneTapOrder(outcome, amount)).toMatchObject({
      blockReason: "prediction.message.belowMinimumNotional",
      minimumOrder: { minQuantity, minTotal, value: 5, upPrice },
    });
    // At 0.5 both directions can exactly meet the minimum with 10 contracts.
    act(() =>
      root!.update(
        <Consumer props={{ ...props, protectionPrice: () => 0.5 }} />,
      ),
    );
    expect(state.evaluateOneTapOrder(outcome, 1).minimumOrder).toEqual({
      minQuantity: 10,
      minTotal: 5,
      value: 5,
      upPrice: 0.5,
    });
    expect(state.evaluateOneTapOrder(outcome, 5)).toMatchObject({
      canPlace: true,
      blockReason: undefined,
    });
    expect(state.evaluateOneTapOrder(outcome, 5).minimumOrder).toBeUndefined();
  },
);

it("reports invalid splits without estimating funds or reporting insufficient balance", () => {
  const props = mount({
    ...input(),
    selectedConfig: {
      base_max: 5,
      min_notional: 5,
    } as OneTapOrdersArgs["selectedConfig"],
    estimateAdditionalFrozen: vi.fn(() => undefined),
  });
  expect(state.evaluateOneTapOrder("up", 10)).toMatchObject({
    blockReason: "prediction.invalidOrder",
    canPlace: false,
  });
  expect(props.estimateAdditionalFrozen).not.toHaveBeenCalled();
});

it.each([0, 10])(
  "accepts valid frozen funds of %s equal to the available balance",
  (requiredFrozen) => {
    mount({
      ...input(),
      balance: requiredFrozen,
      estimateAdditionalFrozen: () => requiredFrozen,
    });
    expect(state.evaluateOneTapOrder("up", 10)).toMatchObject({
      requiredFrozen,
      blockReason: undefined,
      canPlace: true,
    });
  },
);

it("uses outcome depth, permits partial IOC depth and rejects excessive slippage", () => {
  const props = input();
  mount({ ...props, book: { ...props.book, asks: [], downAsks: [[0.4, 1]] } });
  expect(state.evaluateOneTapOrder("up", 10).blockReason).toBe(
    "prediction.message.noExecutableQuotes",
  );
  expect(state.evaluateOneTapOrder("down", 10)).toMatchObject({
    estimatedSlippage: 0,
    canPlace: true,
  });
  act(() =>
    root!.update(
      <Consumer
        props={{
          ...props,
          book: {
            ...props.book,
            downAsks: [
              [0.4, 1],
              [0.5, 100],
            ],
          },
        }}
      />,
    ),
  );
  expect(state.evaluateOneTapOrder("down", 10)).toMatchObject({
    estimatedSlippage: 9.6,
    blockReason: "prediction.message.slippageExceeded",
    canPlace: false,
  });
});

it("disables in-flight presets without a transient depth notice", async () => {
  const props = input();
  mount({ ...props, isSubmitting: true, book: { ...props.book, asks: [] } });
  expect(state.evaluateOneTapOrder("up", 10)).toMatchObject({
    blockReason: undefined,
    canPlace: false,
  });
  await act(async () => state.placeOneTapOrder("up", 10, vi.fn()));
  expect(props.submitOrder).not.toHaveBeenCalled();
  expect(props.notify).not.toHaveBeenCalled();
});

it("rechecks the current balance and book after an allowed preview", async () => {
  const props = mount();
  expect(state.evaluateOneTapOrder("up", 10).canPlace).toBe(true);
  act(() => root!.update(<Consumer props={{ ...props, balance: 9 }} />));
  await act(async () => state.placeOneTapOrder("up", 10, vi.fn()));
  expect(props.notify).toHaveBeenLastCalledWith(
    "prediction.message.insufficientBalance",
    "danger",
  );
  act(() =>
    root!.update(
      <Consumer props={{ ...props, book: { ...props.book, asks: [] } }} />,
    ),
  );
  await act(async () => state.placeOneTapOrder("up", 10, vi.fn()));
  expect(props.notify).toHaveBeenLastCalledWith(
    "prediction.message.noExecutableQuotes",
    "danger",
  );
  expect(props.submitOrder).not.toHaveBeenCalled();
});
