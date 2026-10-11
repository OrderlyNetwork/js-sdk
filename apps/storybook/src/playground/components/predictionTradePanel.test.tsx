import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  useTradePanelScript,
  type TradePanelProps,
  type TradePanelScriptInput,
} from "@orderly.network/prediction/src/prediction/orderEntry/tradePanel.script";

const mocks = vi.hoisted(() => ({
  stored: undefined as unknown,
  save: vi.fn(),
}));
vi.mock("@orderly.network/hooks", async () => {
  const { useState } = await import("react");
  return {
    useLocalStorage: (_key: string, initial: unknown) => {
      const [value, setValue] = useState(mocks.stored ?? initial);
      return [
        value,
        (next: unknown) => {
          mocks.stored = next;
          mocks.save(next);
          setValue(next);
        },
      ];
    },
  };
});
let root: ReactTestRenderer | undefined;
let state: TradePanelProps;
const input = (): TradePanelScriptInput => ({
  tradeMode: "oneTap",
  setTradeMode: vi.fn(),
  orderSide: "buy",
  setOrderSide: vi.fn(),
  orderType: "market",
  selectedOutcome: "down",
  setSelectedOutcome: vi.fn(),
  amountUnit: "quote",
  balance: 100,
  maxAmount: 100,
  hasMaxAmountEstimate: true,
  isRoundTradable: true,
  isRegionRestricted: false,
  executablePrices: {
    buy: { up: 0.8, down: 0.2 },
    sell: { up: 0.8, down: 0.2 },
  },
  isSubmitting: false,
  placeOneTapOrder: vi.fn(),
  limitPrice: "0.2",
  setLimitPrice: vi.fn(),
  amount: "10",
  setAmount: vi.fn(),
  orderQuantity: 10,
  orderNotional: 2,
  orderPercentage: 10,
  setOrderPercentage: vi.fn(),
  odds: 5,
  estimatedPayout: 10,
  canPlaceOrder: true,
  placeOrder: vi.fn(),
  slippage: "2",
  setSlippage: vi.fn(),
  estimatedSlippage: null,
  feeRates: { makerBps: 0, takerBps: 6, makerRate: 0, takerRate: 0.0006 },
  requiredFrozen: 2,
  fundingEstimateMode: "detailed",
  orderEntryAccountReady: true,
  orderEntryFunded: true,
  selectedPrice: 0.2,
  availableQuantity: vi.fn(() => 12),
  estimateFee: vi.fn(() => 0.00096),
  evaluateOneTapOrder: vi.fn((outcome, quote) => ({
    displayPrice: outcome === "up" ? 0.8 : 0.2,
    quantity: quote * 2,
    requiredFrozen: quote,
    estimatedSlippage: outcome === "up" ? 3 : null,
    blockReason: undefined,
    canPlace: true,
  })),
});
function Consumer({ props }: { props: TradePanelScriptInput }) {
  state = useTradePanelScript(props);
  return null;
}
function mount(props = input()) {
  act(() => {
    root = create(<Consumer props={props} />);
  });
  return props;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.stored = undefined;
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
it("preserves custom legacy values, resets factory defaults and keeps explicitly saved objects on reload", () => {
  mocks.stored = [20, 30];
  mount();
  expect(state.oneTapAmounts).toEqual({ up: [20, 30], down: [20, 30] });
  act(() => root!.unmount());
  mocks.stored = [10, 50, 100];
  mount();
  expect(state.oneTapAmounts).toEqual({ up: [10], down: [10] });
  act(() => root!.unmount());
  mocks.stored = { up: [10, 50, 100], down: [10, 100, 1000] };
  mount();
  expect(state.oneTapAmounts).toEqual(mocks.stored);
});
it("validates before saving, edits both directions and keeps one to three rows", () => {
  mount();
  act(() => state.beginOneTapEdit());
  act(() => state.updateOneTapDraft("up", 0, "1.234"));
  let saved = true;
  act(() => {
    saved = state.saveOneTapAmounts();
  });
  expect(saved).toBe(false);
  expect(mocks.save).not.toHaveBeenCalled();
  expect(state.oneTapEditorError).toBe(true);
  act(() => state.updateOneTapDraft("up", 0, "12.34"));
  act(() => state.updateOneTapDraft("down", 0, "20"));
  act(() => {
    saved = state.saveOneTapAmounts();
  });
  expect(saved).toBe(true);
  expect(mocks.save).toHaveBeenCalledWith({ up: [12.34], down: [20] });
  act(() => {
    state.addOneTapRow();
    state.addOneTapRow();
    state.addOneTapRow();
  });
  expect(state.draftOneTapAmounts.up).toHaveLength(3);
  expect(state.draftOneTapAmounts.down).toHaveLength(3);
  act(() => {
    state.removeOneTapRow(0);
    state.removeOneTapRow(0);
    state.removeOneTapRow(0);
  });
  expect(state.draftOneTapAmounts.up).toHaveLength(1);
  expect(state.draftOneTapAmounts.down).toHaveLength(1);
  act(() => state.resetOneTapDraft());
  expect(state.draftOneTapAmounts).toEqual({ up: ["10"], down: ["10"] });
});
it("prices DOWN fees in UP coordinates, keeps unknown fees missing and aggregates only valid one-tap slippage", () => {
  const props = mount();
  expect(props.estimateFee).toHaveBeenCalledWith(10, 0.8, true);
  expect(state.estimatedFee).toBe(0.00096);
  expect(state.oneTapEstimatedSlippage).toBe(3);
  expect(state.availablePositionQuantity).toBe(12);
  act(() =>
    root!.update(
      <Consumer props={{ ...props, estimateFee: () => undefined }} />,
    ),
  );
  expect(state.estimatedFee).toBeUndefined();
});
it("fails closed without auth/funding and skips one-tap calculations in other modes", () => {
  const props = mount({
    ...input(),
    orderEntryAccountReady: undefined,
    orderEntryFunded: undefined,
  });
  expect(state.canAdjustAmount).toBe(false);
  expect(state.oneTapOptions.up[0].disabled).toBe(true);
  vi.mocked(props.evaluateOneTapOrder).mockClear();
  act(() =>
    root!.update(<Consumer props={{ ...props, tradeMode: "limit" }} />),
  );
  expect(props.evaluateOneTapOrder).not.toHaveBeenCalled();
});

it("evaluates each preset once and uses the returned eligibility even without a notice", () => {
  const props = input();
  vi.mocked(props.evaluateOneTapOrder).mockReturnValue({
    displayPrice: 0.6,
    quantity: 12,
    requiredFrozen: 7.2,
    estimatedSlippage: 1,
    blockReason: undefined,
    canPlace: false,
  });
  mount(props);
  expect(props.evaluateOneTapOrder).toHaveBeenCalledTimes(2);
  expect(props.evaluateOneTapOrder).toHaveBeenCalledWith("up", 10);
  expect(props.evaluateOneTapOrder).toHaveBeenCalledWith("down", 10);
  expect(state.oneTapOptions.up[0]).toEqual({
    payout: 12,
    blockReason: null,
    disabled: true,
  });
  expect(state.oneTapEstimatedSlippage).toBe(1);
});

it("validates on click and submits only after correction", () => {
  const props = input();
  props.tradeMode = "limit";
  props.canPlaceOrder = false;
  props.orderValidationError = {
    field: "total",
    key: "orderEntry.total.error.min",
    value: 5,
  };
  mount(props);
  expect(state.submitDisabled).toBe(false);
  expect(state.visibleOrderError).toBeUndefined();
  act(() => state.placeOrder());
  expect(state.visibleOrderError).toEqual(props.orderValidationError);
  expect(props.placeOrder).not.toHaveBeenCalled();
  act(() =>
    root!.update(
      <Consumer
        props={{
          ...props,
          canPlaceOrder: true,
          orderValidationError: undefined,
        }}
      />,
    ),
  );
  expect(state.visibleOrderError).toBeUndefined();
  act(() => state.placeOrder());
  expect(props.placeOrder).toHaveBeenCalledOnce();
  act(() =>
    root!.update(
      <Consumer
        props={{
          ...props,
          amount: "",
          orderValidationError: {
            field: "amount",
            key: "orderEntry.orderQuantity.error.required",
          },
        }}
      />,
    ),
  );
  expect(state.visibleOrderError).toBeUndefined();
});

it.each([
  { orderEntryAccountReady: false },
  { orderEntryFunded: false },
  { isRoundTradable: false },
  { isRegionRestricted: true },
  { isSubmitting: true },
])("keeps submission blocked when trading is unavailable: %j", (gate) => {
  const props = { ...input(), ...gate, tradeMode: "limit" as const };
  mount(props);
  expect(state.submitDisabled).toBe(true);
  act(() => state.placeOrder());
  expect(props.placeOrder).not.toHaveBeenCalled();
});

it("clears validation feedback when changing outcome", () => {
  const props = {
    ...input(),
    tradeMode: "limit" as const,
    canPlaceOrder: false,
  };
  mount(props);
  act(() => state.placeOrder());
  expect(state.visibleOrderError).toBeDefined();
  act(() =>
    root!.update(<Consumer props={{ ...props, selectedOutcome: "up" }} />),
  );
  expect(state.visibleOrderError).toBeUndefined();
});
