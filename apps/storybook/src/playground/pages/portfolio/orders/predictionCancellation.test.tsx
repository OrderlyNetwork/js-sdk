import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScopedPredictionAccount } from "@orderly.network/prediction/src/prediction/dataPanels/useScopedPredictionAccount";
import { usePredictionAccountResources } from "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountResources";
import {
  usePredictionTradingActions,
  type UsePredictionTradingActionsArgs,
} from "@orderly.network/prediction/src/prediction/hooks/usePredictionTradingActions";
import { AccountStatusEnum } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  accountId: "a",
  status: 5,
  orders: [] as any[],
  total: undefined as number | undefined,
  cancel: vi.fn(),
  refresh: vi.fn(),
  notify: vi.fn(),
}));
vi.mock("@orderly.network/hooks", async () => ({
  useSWRConfig: (await import("swr")).useSWRConfig,
  ...(await vi.importActual<any>(
    "@orderly.network/hooks/src/utils/orderCancellation",
  )),
  useMemoizedFn: (
    await vi.importActual<any>(
      "@orderly.network/hooks/src/shared/useMemoizedFn",
    )
  ).useMemoizedFn,
  useAccount: () => ({
    state: { accountId: mocks.accountId, status: mocks.status },
  }),
  useAccountInfo: () => ({
    data: { binary_taker_fee_rate: 6, binary_maker_fee_rate: 0 },
  }),
  useCollateral: () => ({ freeCollateral: 100 }),
  useMarkPricesStream: () => ({ data: {} }),
  useMutation: () => [mocks.cancel],
  useRefreshOrderCaches: () => mocks.refresh,
  useOrderStream: (params: any) => [
    params.status ? mocks.orders : [],
    {
      meta: { total: mocks.total },
      isValidating: false,
      loadMore: vi.fn(),
      refresh: mocks.refresh,
    },
  ],
  usePositionStream: () => [{ rows: [] }],
  usePrivateQuery: () => ({ data: undefined, mutate: mocks.refresh }),
}));
vi.mock("@orderly.network/i18n", () => ({ i18n: { t: (key: string) => key } }));

const btc = "PERP_BTC5M2610091200_USDC";
const eth = "PERP_ETH5M2610091200_USDC";
const row = (symbol: string) =>
  ({
    symbol,
    status: "ACTIVE",
    observation_start_at: Date.now() - 1000,
    expire_at: Date.now() + 60000,
  }) as any;
const defaults = (): Omit<UsePredictionTradingActionsArgs, "resources"> => ({
  active: true,
  binaryRows: [row(btc), row(eth)],
  notify: mocks.notify,
  isRegionRestricted: false,
  selectedSymbol: btc,
  bbo: { bestAsk: undefined, bestBid: undefined },
  slippage: "3",
  book: { asks: [], bids: [], downAsks: [], downBids: [] } as any,
  onActiveTab: vi.fn(),
});
let root: ReactTestRenderer | undefined;
function mount(args = defaults(), underlyingSymbol?: string) {
  let result!: ReturnType<typeof usePredictionTradingActions>;
  let scoped!: ReturnType<typeof useScopedPredictionAccount>;
  function Harness({
    args,
  }: {
    args: Omit<UsePredictionTradingActionsArgs, "resources">;
  }) {
    const resources = usePredictionAccountResources({ enabled: false });
    result = usePredictionTradingActions({ ...args, resources });
    scoped = useScopedPredictionAccount(
      { ...result, settlements: [], historyRecords: [] } as any,
      underlyingSymbol,
    );
    return null;
  }
  act(() => {
    root = create(createElement(Harness, { args }));
  });
  return {
    get result() {
      return result;
    },
    get scoped() {
      return scoped;
    },
    update(next = args) {
      act(() => root!.update(createElement(Harness, { args: next })));
    },
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.accountId = "a";
  mocks.status = AccountStatusEnum.EnableTrading;
  mocks.orders = [btc, eth].map((symbol, index) => ({
    symbol,
    order_id: index + 1,
    side: "BUY",
    status: "NEW",
    type: "LIMIT",
    quantity: 1,
    price: 0.5,
  }));
  mocks.total = 2;
  mocks.cancel.mockResolvedValue({ success: true });
  mocks.refresh.mockResolvedValue(undefined);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  vi.restoreAllMocks();
});

describe("PredictionState.cancelAllOrders boolean contract", () => {
  it("scopes underlying symbols and preserves the scoped method's boolean result", async () => {
    const harness = mount(defaults(), "PERP_BTC_USDC");
    expect(await harness.scoped.cancelAllOrders()).toBe(true);
    expect(mocks.cancel).toHaveBeenCalledExactlyOnceWith(null, { symbol: btc });
    expect(mocks.refresh).toHaveBeenCalledWith("a");
    mocks.cancel.mockResolvedValue({ success: false, message: "REJECTED" });
    expect(await harness.scoped.cancelAllOrders()).toBe(false);
    expect(mocks.notify).toHaveBeenLastCalledWith("REJECTED", "danger");
  });

  it.each([
    "restricted",
    "closed",
    "incomplete",
    "missing",
    "empty",
    "account",
  ])("returns false without requests when %s", async (condition) => {
    const args = defaults();
    if (condition === "restricted") args.isRegionRestricted = true;
    if (condition === "closed") args.binaryRows = [];
    if (condition === "incomplete") mocks.total = 3;
    if (condition === "missing") mocks.total = undefined;
    if (condition === "empty") {
      mocks.orders = [];
      mocks.total = 0;
    }
    if (condition === "account") mocks.status = AccountStatusEnum.NotConnected;
    expect(await mount(args).result.cancelAllOrders()).toBe(false);
    expect(mocks.cancel).not.toHaveBeenCalled();
  });

  it("reports partial failure without overall success and tolerates refresh failure", async () => {
    mocks.cancel
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error("FAILED"));
    mocks.refresh.mockRejectedValue(new Error("REFRESH_FAILED"));
    expect(await mount().result.cancelAllOrders()).toBe(false);
    expect(mocks.cancel).toHaveBeenCalledTimes(2);
    expect(mocks.notify).toHaveBeenCalledExactlyOnceWith("FAILED", "danger");
  });

  it("keeps a successful cancellation successful if refresh fails", async () => {
    mocks.refresh.mockRejectedValue(new Error("REFRESH_FAILED"));
    expect(await mount().result.cancelAllOrders()).toBe(true);
    expect(mocks.notify).toHaveBeenCalledExactlyOnceWith(
      "prediction.message.ordersCanceled",
    );
  });

  it("rejects duplicate calls and stops subsequent symbols after an account change", async () => {
    let finish!: (response: unknown) => void;
    mocks.cancel.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const harness = mount();
    const pending = harness.result.cancelAllOrders();
    expect(await harness.result.cancelAllOrders()).toBe(false);
    mocks.accountId = "b";
    harness.update();
    finish({ success: true });
    expect(await pending).toBe(false);
    expect(mocks.cancel).toHaveBeenCalledOnce();
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(mocks.notify).not.toHaveBeenCalled();
  });
});
