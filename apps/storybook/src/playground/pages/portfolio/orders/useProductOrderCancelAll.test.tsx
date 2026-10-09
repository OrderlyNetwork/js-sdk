import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useProductOrderCancelAll,
  type ProductOrderCancelAllOptions,
} from "@orderly.network/prediction/src/prediction/dataPanels/useProductOrderCancelAll";

const mocks = vi.hoisted(() => ({
  accountId: "account-1",
  canTrade: true,
  pages: undefined as any,
  validating: false,
  query: vi.fn(),
  mutate: vi.fn(),
  refresh: vi.fn(),
  setSize: vi.fn(),
  cancelOrders: vi.fn(),
  cancelAlgoOrders: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  dialog: null as any,
  resolveDialog: null as any,
  confirm: vi.fn(),
}));
vi.mock("@orderly.network/hooks", async () => ({
  ...(await vi.importActual<any>(
    "@orderly.network/hooks/src/utils/orderCancellation",
  )),
  useAccount: () => ({ state: { accountId: mocks.accountId } }),
  useMemoizedFn: (
    await vi.importActual<any>(
      "@orderly.network/hooks/src/shared/useMemoizedFn",
    )
  ).useMemoizedFn,
  useMutation: (url: string) => [
    url === "/v1/orders" ? mocks.cancelOrders : mocks.cancelAlgoOrders,
  ],
  useRefreshOrderCaches: () => mocks.refresh,
  usePrivateInfiniteQuery: (...args: unknown[]) => {
    mocks.query(...args);
    return {
      data: mocks.pages,
      isLoading: false,
      isValidating: mocks.validating,
      mutate: mocks.mutate,
      setSize: mocks.setSize,
    };
  },
}));
vi.mock("@orderly.network/react-app", () => ({
  useCanTrade: () => mocks.canTrade,
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) =>
      options?.scope ? `${key}:${options.scope}` : key,
  }),
}));
vi.mock("@orderly.network/ui", () => ({
  Text: ({ children }: any) => children,
  toast: { success: mocks.success, error: mocks.error },
  modal: {
    confirm: (options: any) => {
      mocks.confirm(options);
      mocks.dialog = options;
      return new Promise((resolve) => {
        mocks.resolveDialog = resolve;
      });
    },
  },
}));
vi.mock("@orderly.network/ui-orders", async () =>
  vi.importActual(
    "@orderly.network/ui-orders/src/components/orderList/useCancelAllConfirmation",
  ),
);

const live = "PERP_BTC5M2610091200_USDC";
const other = "PERP_ETH5M2610091200_USDC";
function predictionState(patch: Record<string, unknown> = {}) {
  return {
    accountId: mocks.accountId,
    accountReady: true,
    openOrders: [{ symbol: live }],
    pendingOrdersComplete: true,
    isRegionRestricted: false,
    isOrderTradable: () => true,
    ...patch,
  } as any;
}
let renderer: ReactTestRenderer;
function mount(options: ProductOrderCancelAllOptions, legacy = false) {
  let result!: ReturnType<typeof useProductOrderCancelAll>;
  function Harness({ options }: { options: ProductOrderCancelAllOptions }) {
    result = legacy
      ? useProductOrderCancelAll(
          options.state,
          options.enabled ?? true,
          options.instrument !== "perps",
          options.perpsSymbol,
        )
      : useProductOrderCancelAll(options);
    return null;
  }
  act(() => {
    renderer = create(createElement(Harness, { options }));
  });
  return {
    get result() {
      return result;
    },
    update(next: ProductOrderCancelAllOptions) {
      act(() => renderer.update(createElement(Harness, { options: next })));
    },
  };
}
async function execute(harness: ReturnType<typeof mount>) {
  let result = false;
  await act(async () => {
    result = await harness.result.cancelAll!();
  });
  return result;
}
function open(harness: ReturnType<typeof mount>) {
  let promise!: Promise<boolean>;
  act(() => {
    promise = harness.result.onCancelAll!();
  });
  return promise;
}
async function confirm() {
  let result = false;
  await act(async () => {
    result = await mocks.dialog.onOk();
    mocks.resolveDialog(result);
  });
  return result;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.accountId = "account-1";
  mocks.canTrade = true;
  mocks.validating = false;
  mocks.pages = [
    { rows: [{ order_id: 1, symbol: "PERP_BTC_USDC" }], meta: { total: 1 } },
  ];
  mocks.mutate.mockImplementation(async () => mocks.pages);
  mocks.refresh.mockResolvedValue(undefined);
  mocks.cancelOrders.mockResolvedValue({ success: true });
  mocks.cancelAlgoOrders.mockResolvedValue({ success: true });
});
afterEach(() => {
  if (renderer) act(() => renderer.unmount());
});

describe("SDK product cancellation", () => {
  it("blocks cancellation when the account has no ID", async () => {
    mocks.accountId = "";
    const harness = mount({
      state: predictionState(),
      instrument: "prediction",
    });
    expect(harness.result.disabled).toBe(true);
    expect(await execute(harness)).toBe(false);
    expect(mocks.cancelOrders).not.toHaveBeenCalled();
  });
  it.each(["all", "perps"] as const)(
    "preserves native %s fallback without a provider",
    (instrument) => {
      const { result } = mount({ state: null, instrument });
      expect(result.cancelAll).toBeUndefined();
      expect(result.onCancelAll).toBeUndefined();
      expect(result.disabled).toBeUndefined();
      expect(result.orderListProps).toEqual({});
      expect(mocks.query).toHaveBeenLastCalledWith(
        null,
        expect.objectContaining({ refreshInterval: 0 }),
      );
    },
  );
  it("keeps trading guards during native fallback", () => {
    mocks.canTrade = false;
    const { result } = mount({ state: null, instrument: "perps" });
    expect(result.orderListProps.cancelAllDisabled).toBe(true);
  });
  it("disables Prediction without a provider", async () => {
    const harness = mount({ state: null, instrument: "prediction" });
    expect(harness.result.disabled).toBe(true);
    expect(await execute(harness)).toBe(false);
    expect(mocks.cancelOrders).not.toHaveBeenCalled();
  });
  it("retains legacy positional calls and PERP algo types", async () => {
    const harness = mount(
      { state: predictionState(), instrument: "perps" },
      true,
    );
    expect(await execute(harness)).toBe(true);
    expect(mocks.cancelOrders).toHaveBeenCalledExactlyOnceWith(null, {
      symbol: "PERP_BTC_USDC",
    });
    expect(mocks.cancelAlgoOrders.mock.calls).toEqual([
      [null, { symbol: "PERP_BTC_USDC", algo_type: "STOP" }],
      [null, { symbol: "PERP_BTC_USDC", algo_type: "TRAILING_STOP" }],
    ]);
  });
  it("Binary-only never queries or waits for PERP and respects underlying scope", async () => {
    mocks.pages = undefined;
    const harness = mount({
      state: predictionState({
        openOrders: [{ symbol: live }, { symbol: other }],
      }),
      instrument: "prediction",
      predictionUnderlyingSymbol: "PERP_BTC_USDC",
    });
    expect(harness.result.disabled).toBe(false);
    expect(await execute(harness)).toBe(true);
    expect(mocks.query).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ refreshInterval: 0 }),
    );
    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(mocks.cancelAlgoOrders).not.toHaveBeenCalled();
    expect(mocks.cancelOrders).toHaveBeenCalledExactlyOnceWith(null, {
      symbol: live,
    });
  });
  it.each([
    { accountReady: false },
    { pendingOrdersComplete: false },
    { isRegionRestricted: true },
    { openOrders: [] },
    { isOrderTradable: () => false },
  ])("blocks unavailable Binary snapshots: %o", async (patch) => {
    const harness = mount({
      state: predictionState(patch),
      instrument: "prediction",
    });
    expect(harness.result.disabled).toBe(true);
    expect(await execute(harness)).toBe(false);
    expect(mocks.cancelOrders).not.toHaveBeenCalled();
  });
  it("All applies independent PERP and Binary scopes to both confirmation and requests", async () => {
    mocks.pages[0].rows.push({ order_id: 2, symbol: "PERP_ETH_USDC" });
    mocks.pages[0].meta.total = 2;
    const harness = mount({
      state: predictionState({
        openOrders: [{ symbol: live }, { symbol: other }],
      }),
      instrument: "all",
      perpsSymbol: "PERP_ETH_USDC",
      predictionUnderlyingSymbol: "PERP_BTC_USDC",
    });
    const pending = open(harness);
    expect(mocks.dialog.content.props.children).toContain("ETH");
    expect(mocks.dialog.content.props.children).toContain("BTC");
    expect(await confirm()).toBe(true);
    expect(await pending).toBe(true);
    expect(mocks.cancelOrders.mock.calls).toEqual([
      [null, { symbol: "PERP_ETH_USDC" }],
      [null, { symbol: live }],
    ]);
  });
  it("requires complete PERP coverage and preserves region-restricted PERP-only cancellation", async () => {
    mocks.pages[0].meta.total = 2;
    let harness = mount({ state: predictionState(), instrument: "perps" });
    expect(await execute(harness)).toBe(false);
    act(() => renderer.unmount());
    mocks.pages[0].meta.total = 1;
    harness = mount({
      state: predictionState({ isRegionRestricted: true }),
      instrument: "perps",
    });
    expect(await execute(harness)).toBe(true);
  });
  it.each(["envelope", "rejection"])(
    "returns false for %s failure without reporting success",
    async (kind) => {
      if (kind === "envelope")
        mocks.cancelOrders.mockResolvedValue({
          success: false,
          message: "CANCEL_REJECTED",
        });
      else mocks.cancelOrders.mockRejectedValue(new Error("CANCEL_REJECTED"));
      const harness = mount({
        state: predictionState(),
        instrument: "prediction",
      });
      expect(await execute(harness)).toBe(false);
      expect(mocks.error).toHaveBeenCalledWith("CANCEL_REJECTED");
      expect(mocks.success).not.toHaveBeenCalled();
      expect(mocks.refresh).toHaveBeenCalledOnce();
    },
  );
  it("partial failure stops later symbols and does not show overall success", async () => {
    mocks.cancelOrders
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: false, message: "SECOND_FAILED" });
    const harness = mount({
      state: predictionState({
        openOrders: [
          { symbol: live },
          { symbol: other },
          { symbol: "PERP_SOL5M2610091200_USDC" },
        ],
      }),
      instrument: "prediction",
    });
    expect(await execute(harness)).toBe(false);
    expect(mocks.cancelOrders).toHaveBeenCalledTimes(2);
    expect(mocks.success).not.toHaveBeenCalled();
  });
  it("refresh failure preserves the cancellation result", async () => {
    mocks.refresh.mockRejectedValue(new Error("refresh failed"));
    const harness = mount({
      state: predictionState(),
      instrument: "prediction",
    });
    expect(await execute(harness)).toBe(true);
    expect(mocks.error).not.toHaveBeenCalled();
  });
  it("PERP symbol scope excludes unrelated cached rows", async () => {
    mocks.pages[0].rows.push({ order_id: 2, symbol: "PERP_ETH_USDC" });
    mocks.pages[0].meta.total = 2;
    const harness = mount({
      state: predictionState(),
      instrument: "perps",
      perpsSymbol: "PERP_BTC_USDC",
    });
    expect(await execute(harness)).toBe(true);
    expect(mocks.cancelOrders).toHaveBeenCalledExactlyOnceWith(null, {
      symbol: "PERP_BTC_USDC",
    });
  });
});

describe("real hook confirmation updates", () => {
  it("confirms before sending a request and prevents duplicate dialogs", async () => {
    const harness = mount({
      state: predictionState(),
      instrument: "prediction",
    });
    const promise = open(harness);
    expect(mocks.cancelOrders).not.toHaveBeenCalled();
    expect(harness.result.disabled).toBe(true);
    expect(await harness.result.onCancelAll!()).toBe(false);
    expect(mocks.confirm).toHaveBeenCalledOnce();
    expect(await confirm()).toBe(true);
    expect(await promise).toBe(true);
  });
  it("cancelling the dialog sends no mutation", async () => {
    const harness = mount({
      state: predictionState(),
      instrument: "prediction",
    });
    const promise = open(harness);
    await act(async () => {
      mocks.resolveDialog(await mocks.dialog.onCancel());
    });
    expect(await promise).toBe(false);
    expect(mocks.cancelOrders).not.toHaveBeenCalled();
  });
  it("account switching while a dialog is open cannot cancel the new account", async () => {
    const harness = mount({
      state: predictionState(),
      instrument: "prediction",
    });
    const promise = open(harness);
    mocks.accountId = "account-2";
    harness.update({ state: predictionState(), instrument: "prediction" });
    expect(await confirm()).toBe(false);
    expect(await promise).toBe(false);
    expect(mocks.cancelOrders).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledWith("orders.cancelAll.contextChanged");
  });
  it("scope switching, even away and back, invalidates the original confirmation", async () => {
    const state = predictionState();
    const harness = mount({ state, instrument: "prediction" });
    const promise = open(harness);
    harness.update({ state, instrument: "all" });
    harness.update({ state, instrument: "prediction" });
    expect(await confirm()).toBe(false);
    expect(await promise).toBe(false);
    expect(mocks.cancelOrders).not.toHaveBeenCalled();
  });
  it("new restrictions block an already-open confirmation", async () => {
    const harness = mount({
      state: predictionState(),
      instrument: "prediction",
    });
    const promise = open(harness);
    harness.update({
      state: predictionState({ isRegionRestricted: true }),
      instrument: "prediction",
    });
    expect(await confirm()).toBe(false);
    expect(await promise).toBe(false);
    expect(mocks.cancelOrders).not.toHaveBeenCalled();
  });
  it("account switching in flight stops subsequent symbols and avoids refreshing old keys", async () => {
    let release!: (value: unknown) => void;
    mocks.cancelOrders.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const harness = mount({
      state: predictionState({
        openOrders: [{ symbol: live }, { symbol: other }],
      }),
      instrument: "prediction",
    });
    let promise!: Promise<boolean>;
    act(() => {
      promise = harness.result.cancelAll!();
    });
    expect(harness.result.isCancelling).toBe(true);
    expect(await harness.result.cancelAll!()).toBe(false);
    mocks.accountId = "account-2";
    harness.update({ state: predictionState(), instrument: "prediction" });
    await act(async () => {
      release({ success: true });
      expect(await promise).toBe(false);
    });
    expect(mocks.cancelOrders).toHaveBeenCalledOnce();
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });
});
