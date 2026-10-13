import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { useManagedPositionsScript } from "@orderly.network/prediction/src/prediction/dataPanels/holdings/managedPositions.script";
import { useOrderSubmission } from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useOrderSubmission";
import { usePredictionAccountActions } from "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountActions";
import { usePredictionTargetResources } from "@orderly.network/prediction/src/prediction/hooks/usePredictionTargetResources";
import { AccountStatusEnum, MarginMode } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  accountId: "main",
  main: true,
  children: ["sub", "empty"],
  aggregate: [] as any[],
  position: {} as any,
  orders: { rows: [], meta: { total: 0 } } as any,
  info: { binary_taker_fee_rate: 100, binary_maker_fee_rate: 20 } as any,
  aggregateError: undefined as unknown,
  queryError: undefined as unknown,
  subQuery: vi.fn(),
  privateQuery: vi.fn(),
  currentMutation: vi.fn(),
  scopedMutation: vi.fn(),
  refreshPositions: vi.fn(),
  refreshOrders: vi.fn(),
  refreshInfo: vi.fn(),
  refreshAggregate: vi.fn(),
  moreOrders: vi.fn(),
  notify: vi.fn(),
  expired: false,
  restricted: false,
}));
vi.mock("@orderly.network/hooks", () => ({
  useAccount: () => ({
    account: {
      get accountId() {
        return mocks.accountId;
      },
      get stateValue() {
        return {
          status: AccountStatusEnum.EnableTrading,
          subAccounts: mocks.children.map((id) => ({ id })),
        };
      },
    },
    state: {
      accountId: mocks.accountId,
      status: AccountStatusEnum.EnableTrading,
      subAccounts: mocks.children.map((id) => ({ id })),
    },
    isMainAccount: mocks.main,
  }),
  useAccountInfo: () => ({
    data: { binary_taker_fee_rate: 999, binary_maker_fee_rate: 999 },
  }),
  useMarkPricesStream: () => ({ data: {} }),
  useMemoizedFn: (fn: any) => fn,
  useMutation: () => [mocks.currentMutation, {}],
  useRefreshOrderCaches: () => vi.fn(),
  usePrivateQuery: (url: string, options: any) => {
    mocks.privateQuery(url, options);
    return {
      data: url ? mocks.aggregate : undefined,
      error: mocks.aggregateError,
      mutate: mocks.refreshAggregate,
    };
  },
  useSubAccountQuery: (url: string, options: any) => {
    mocks.subQuery(url, options);
    const active = !!options.accountId;
    if (url === "/v1/positions")
      return {
        data: active ? { rows: [mocks.position] } : undefined,
        mutate: mocks.refreshPositions,
        error: mocks.queryError,
      };
    if (url === "/v1/client/info")
      return {
        data: active ? mocks.info : undefined,
        mutate: mocks.refreshInfo,
        error: mocks.queryError,
      };
    return {
      data: active ? mocks.orders : undefined,
      mutate: mocks.refreshOrders,
      error: mocks.queryError,
    };
  },
  useSubAccountMutation: (url: string, method: string, options: any) => [
    async (body: any, params: any) => {
      if (options.shouldExecute && !options.shouldExecute())
        throw new Error("revoked");
      if (method === "GET") return mocks.moreOrders(params);
      return mocks.scopedMutation(url, options.accountId, body);
    },
    {},
  ],
}));
vi.mock("@orderly.network/i18n", () => ({ i18n: { t: (key: string) => key } }));
vi.mock("@orderly.network/ui-assets", () => ({
  AccountType: { ALL: "All accounts", MAIN: "Main accounts" },
}));

const symbol = "PERP_BTC5M2610120755_USDC";
let root: ReactTestRenderer;
let resources: ReturnType<typeof usePredictionTargetResources>;
let list: ReturnType<typeof useManagedPositionsScript>;
let submission: ReturnType<typeof useOrderSubmission>;
let accountActions: ReturnType<typeof usePredictionAccountActions>;
let mounted = { current: true };
const current = () =>
  ({
    accountId: mocks.accountId,
    accountReady: true,
    positions: [{ symbol, outcome: "up", quantity: 10, averagePrice: 0.4 }],
    availableQuantity: () => 10,
    positionsLoading: false,
  }) as any;
function List({ selectedAccount = "All accounts" }) {
  list = useManagedPositionsScript(current(), selectedAccount);
  return null;
}
function Target({ target = "sub", enabled = true }) {
  resources = usePredictionTargetResources(target, enabled);
  const row = {
    symbol,
    status: "ACTIVE",
    expire_at: Date.now() + (mocks.expired ? -1 : 60000),
    base_tick: 1,
    base_min: 1,
    base_max: 10000,
    quote_tick: 0.01,
    min_notional: 1,
  } as any;
  accountActions = usePredictionAccountActions({
    resources: resources as any,
    binaryRows: [row],
    active: enabled,
    selectedSymbol: symbol,
    isRegionRestricted: mocks.restricted,
    notify: mocks.notify,
  });
  submission = useOrderSubmission({
    resources: resources as any,
    active: enabled,
    notify: mocks.notify,
    isRegionRestricted: mocks.restricted,
    selectedSymbol: symbol,
    bbo: { bestAsk: 0.6, bestBid: 0.4 },
    slippage: "2",
    book: {
      asks: [[0.6, 100]],
      bids: [[0.4, 100]],
      downAsks: [[0.6, 100]],
      downBids: [[0.4, 100]],
    } as any,
    onSubmitted: mocks.refreshAggregate,
    configBySymbol: new Map([[symbol, row]]),
    hasFeeConfig: accountActions.hasFeeConfig,
    refreshOrders: resources.refreshOrders,
    bulkCancellationMounted: mounted,
    availableQuantity: resources.availableQuantity,
    estimateAdditionalFrozen: () => 0,
    protectionPrice: () => 0.4,
    isOrderTradable: () => !mocks.expired,
  });
  return null;
}
const render = (element: any) =>
  act(() => {
    root = create(element);
  });
const sell = async (
  outcome: "up" | "down" = "up",
  type: "market" | "limit" = "limit",
) => {
  let result: boolean;
  await act(async () => {
    result = await submission.sellPosition(outcome, 10, type, 0.4, symbol);
  });
  return result!;
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.accountId = "main";
  mocks.main = true;
  mocks.children = ["sub", "empty"];
  mocks.queryError = mocks.aggregateError = undefined;
  mocks.expired = mocks.restricted = false;
  mocks.position = {
    symbol,
    position_qty: 20,
    average_open_price: 0.5,
    mark_price: 0.5,
    pending_long_qty: 0,
    pending_short_qty: 2,
    margin_mode: MarginMode.ISOLATED,
  };
  mocks.aggregate = [
    { ...mocks.position, account_id: "sub" },
    { ...mocks.position, account_id: "main", position_qty: 99 },
  ];
  mocks.orders = { rows: [], meta: { total: 0 } };
  mocks.info = { binary_taker_fee_rate: 100, binary_maker_fee_rate: 20 };
  mocks.refreshPositions.mockImplementation(async () => ({
    rows: [mocks.position],
  }));
  mocks.refreshOrders.mockImplementation(async () => mocks.orders);
  mocks.refreshInfo.mockImplementation(async () => mocks.info);
  mocks.scopedMutation.mockResolvedValue({
    success: true,
    data: { order_id: 1 },
  });
  mocks.refreshAggregate.mockResolvedValue(undefined);
  mounted = { current: true };
});
afterEach(() => act(() => root?.unmount()));

it("merges current live rows with children and keeps all/main/child scopes", () => {
  render(<List />);
  expect(
    list.state.positions.map((row) => [row.accountId, row.quantity]),
  ).toEqual([
    ["main", 10],
    ["sub", 20],
  ]);
  expect(mocks.privateQuery.mock.calls[0][1].refreshInterval).toBeUndefined();
  act(() => root.update(<List selectedAccount="Main accounts" />));
  expect(list.state.positions.map((row) => row.accountId)).toEqual(["main"]);
  act(() => root.update(<List selectedAccount="sub" />));
  expect(list.state.positions.map((row) => row.accountId)).toEqual(["sub"]);
  expect(
    list
      .getPositionState(list.state.positions[0])
      .availableQuantity("up", undefined, symbol),
  ).toBe(18);
  act(() => root.update(<List selectedAccount="empty" />));
  expect(list.state.positions).toEqual([]);
  expect(list.subAccounts.map((account) => account.id)).toContain("empty");
});
it("sub-account login only shows its live positions and disables aggregate queries", () => {
  mocks.main = false;
  mocks.accountId = "sub";
  render(<List />);
  expect(mocks.privateQuery.mock.calls[0][0]).toBeNull();
  expect(list.state.positions).toHaveLength(1);
  expect(list.state.positions[0].quantity).toBe(10);
});
it("aggregate failures remain explicit and disable stale child close buttons", () => {
  mocks.aggregateError = new Error("denied");
  render(<List />);
  expect(list.error).toBe(mocks.aggregateError);
  expect(list.getPositionState(list.state.positions[1]).accountReady).toBe(
    false,
  );
});
it.each(["market", "limit"] as const)(
  "sends %s reduce-only ISOLATED orders to the target and refreshes bound resources",
  async (type) => {
    render(<Target />);
    expect(resources.availableQuantity("up", undefined, symbol)).toBe(18);
    expect(accountActions.feeRates.takerBps).toBe(100);
    expect(await sell("up", type)).toBe(true);
    expect(mocks.scopedMutation).toHaveBeenCalledWith(
      "/v1/order",
      "sub",
      expect.objectContaining({
        side: "SELL",
        reduce_only: true,
        margin_mode: "ISOLATED",
        order_quantity: "10",
        order_type: type === "limit" ? "LIMIT" : "IOC",
      }),
    );
    expect(mocks.currentMutation).not.toHaveBeenCalled();
    expect(mocks.refreshPositions).toHaveBeenCalledTimes(2);
    expect(mocks.refreshOrders).toHaveBeenCalledTimes(2);
    expect(resources.positions[0].quantity).toBe(20);
    expect(mocks.refreshAggregate).toHaveBeenCalledTimes(1);
  },
);
it("DOWN exits use target short holdings and UP BUY prices", async () => {
  mocks.position.position_qty = -20;
  render(<Target />);
  expect(await sell("down")).toBe(true);
  expect(mocks.scopedMutation).toHaveBeenCalledWith(
    "/v1/order",
    "sub",
    expect.objectContaining({ side: "BUY", order_price: "0.60" }),
  );
});
it.each(["positions", "orders", "fee", "region", "expiry"])(
  "fails closed when target %s validation fails",
  async (problem) => {
    render(<Target />);
    if (problem === "positions")
      mocks.refreshPositions.mockRejectedValue(new Error("denied"));
    if (problem === "orders") mocks.orders = { rows: [], meta: { total: 1 } };
    if (problem === "fee") mocks.info = {};
    if (problem === "region") mocks.restricted = true;
    if (problem === "expiry") mocks.expired = true;
    act(() => root.update(<Target />));
    expect(await sell()).toBe(false);
    expect(mocks.scopedMutation).not.toHaveBeenCalled();
    expect(mocks.currentMutation).not.toHaveBeenCalled();
  },
);
it("rechecks fresh holdings and pending reservations immediately before sending", async () => {
  render(<Target />);
  mocks.position = { ...mocks.position, pending_short_qty: 15 };
  expect(await sell()).toBe(false);
  expect(mocks.scopedMutation).not.toHaveBeenCalled();
});
it.each(["account", "membership", "target", "unmount"])(
  "stops submission when %s changes during risk refresh",
  async (change) => {
    let finish!: (value: any) => void;
    mocks.refreshPositions.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(<Target />);
    let pending: Promise<boolean>;
    act(() => {
      pending = submission.sellPosition("up", 10, "limit", 0.4, symbol);
    });
    if (change === "account") mocks.accountId = "other";
    if (change === "membership") mocks.children = [];
    act(() =>
      change === "unmount"
        ? root.unmount()
        : root.update(
            <Target target={change === "target" ? "empty" : "sub"} />,
          ),
    );
    await act(async () => {
      finish({ rows: [mocks.position] });
      await pending!;
    });
    expect(mocks.scopedMutation).not.toHaveBeenCalled();
    expect(mocks.currentMutation).not.toHaveBeenCalled();
  },
);
it("disabled target resources issue no scoped queries", () => {
  render(<Target enabled={false} />);
  expect(
    mocks.subQuery.mock.calls.every(([, options]) => !options.accountId),
  ).toBe(true);
});
it("loads all target Binary pending pages with explicit target GET mutation", async () => {
  render(<Target />);
  const options = mocks.subQuery.mock.calls.find(([url]) =>
    url.startsWith("/v1/orders"),
  )![1];
  const orders = Array.from({ length: 125 }, (_, order_id) => ({
    symbol,
    order_id,
  }));
  mocks.moreOrders.mockResolvedValue({
    success: true,
    data: { rows: orders.slice(100), meta: { total: 125 } },
  });
  const data = await options.formatter({
    rows: orders.slice(0, 100),
    meta: { total: 125 },
  });
  expect(data.rows).toHaveLength(125);
  expect(mocks.moreOrders).toHaveBeenCalledWith({
    status: "INCOMPLETE",
    product_type: "BINARY",
    size: 100,
    page: 2,
  });
});

it("refreshes aggregate immediately without waiting for slow target order revalidation", async () => {
  let finish!: (value: any) => void;
  mocks.refreshOrders
    .mockResolvedValueOnce(mocks.orders)
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
  render(<Target />);
  let pending!: Promise<boolean>;
  await act(async () => {
    pending = submission.sellPosition("up", 10, "limit", 0.4, symbol);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  expect(mocks.refreshAggregate).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish(mocks.orders);
    await pending;
  });
});
it("updates partially filled holdings from the target instead of removing accepted positions", async () => {
  mocks.scopedMutation.mockImplementationOnce(async () => {
    mocks.position = { ...mocks.position, position_qty: 15 };
    return { success: true, data: { order_id: 1 } };
  });
  render(<Target />);
  expect(await sell()).toBe(true);
  expect(resources.positions[0].quantity).toBe(15);
});
it("a rejected close keeps positions and does not refresh aggregate as accepted", async () => {
  mocks.scopedMutation.mockResolvedValueOnce({
    success: false,
    message: "denied",
  });
  render(<Target />);
  expect(await sell()).toBe(false);
  expect(resources.positions[0].quantity).toBe(20);
  expect(mocks.refreshAggregate).not.toHaveBeenCalled();
});

it("refreshes accepted positions even if a background target query fails in flight", async () => {
  let finish!: (value: any) => void;
  mocks.scopedMutation.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  render(<Target />);
  let pending!: Promise<boolean>;
  await act(async () => {
    pending = submission.sellPosition("up", 10, "limit", 0.4, symbol);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  mocks.queryError = new Error("temporary query failure");
  act(() => root.update(<Target />));
  await act(async () => {
    finish({ success: true, data: { order_id: 1 } });
    await pending;
  });
  expect(mocks.refreshAggregate).toHaveBeenCalledTimes(1);
  expect(mocks.refreshPositions).toHaveBeenCalledTimes(2);
});
