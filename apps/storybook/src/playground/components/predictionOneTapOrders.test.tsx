import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import {
  useOneTapOrders,
  type OneTapOrders,
  type OneTapOrdersArgs,
} from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useOneTapOrders";

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

it.each(["up", "down"] as const)(
  "sizes %s once at protection price and submits the same tick-aligned estimate",
  async (outcome) => {
    const props = mount();
    const quantity = outcome === "up" ? 16.66 : 25;
    const displayPrice = outcome === "up" ? 0.6 : 0.4;
    expect(state.evaluateOneTapOrder(outcome, 10)).toEqual({
      displayPrice,
      quantity,
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
    "insufficientBalance",
  ],
  ["funds", { balance: 9 }, 10, "insufficientBalance"],
  ["zero amount", {}, 0, "invalidOrder"],
  ["invalid amount", {}, NaN, "invalidOrder"],
  ["below one tick", {}, 0.001, "invalidOrder"],
  ["below UP notional", {}, 1, "invalidOrder"],
] satisfies [string, Partial<OneTapOrdersArgs>, number, string][])(
  "uses the same rejection for the %s gate, button and submission",
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
    expect(state.oneTapBlockReason("up", amount)).toBe(reason);
    expect(state.canPlaceOneTapOrder("up", amount)).toBe(false);
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
    "prediction.invalidOrder",
  );
});

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
