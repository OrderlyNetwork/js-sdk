import { useEffect, useLayoutEffect, useRef } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { PredictionOpenOrder } from "@orderly.network/prediction";
import { useOrderEditing } from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useOrderEditing";
import type { PredictionAccountResources } from "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountResources";
import type { API } from "@orderly.network/types";

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  notify: vi.fn(),
  available: vi.fn(),
  max: vi.fn(),
}));
vi.mock("@orderly.network/hooks", () => ({
  useMutation: () => [mocks.update],
}));

const symbol = "PERP_BTC5M2608271200_USDC";
const order: PredictionOpenOrder = {
  id: 42,
  symbol,
  outcome: "down",
  side: "sell",
  type: "limit",
  orderType: "POST_ONLY",
  clientOrderId: "client-42",
  orderTag: "tag",
  reduceOnly: true,
  price: 0.8,
  quantity: 20,
  filledQuantity: 10,
  timestamp: 0,
  round: 0,
};
const config = {
  symbol,
  status: "ACTIVE",
  expire_at: Number.MAX_SAFE_INTEGER,
  quote_min: 0.01,
  quote_max: 0.99,
  quote_tick: 0.01,
  base_min: 0.01,
  base_max: 10000,
  base_tick: 0.01,
  min_notional: 5,
} as API.BinaryInfoRow;
type Props = {
  accountId?: string;
  active?: boolean;
  restricted?: boolean;
  expired?: boolean;
  orderChanges?: Partial<PredictionOpenOrder>;
  configChanges?: Partial<API.BinaryInfoRow>;
};
let root: ReactTestRenderer | undefined;
let edit: ReturnType<typeof useOrderEditing>["editPendingOrder"];
let getQuantityLimits: ReturnType<
  typeof useOrderEditing
>["getOrderEditQuantityLimits"];
function Consumer({
  accountId = "A",
  active = true,
  restricted = false,
  expired = false,
  orderChanges,
  configChanges,
}: Props) {
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  const editing = useOrderEditing({
    resources: {
      openOrders: [{ ...order, ...orderChanges }],
      accountState: { accountId },
      accountReady: true,
    } as PredictionAccountResources,
    active,
    mounted,
    configBySymbol: new Map([
      [
        symbol,
        { ...config, ...configChanges, ...(expired ? { expire_at: 0 } : {}) },
      ],
    ]),
    isRegionRestricted: restricted,
    notify: mocks.notify,
    availableQuantity: mocks.available,
    maxOpeningQuantity: mocks.max,
  });
  useLayoutEffect(() => {
    edit = editing.editPendingOrder;
    getQuantityLimits = editing.getOrderEditQuantityLimits;
  }, [editing.editPendingOrder, editing.getOrderEditQuantityLimits]);
  return null;
}
function mount(props: Props = {}) {
  act(() => {
    root = create(<Consumer {...props} />);
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.update.mockResolvedValue({ success: true });
  mocks.available.mockReturnValue(10);
  mocks.max.mockReturnValue(100);
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  vi.restoreAllMocks();
});

it("exposes reduce-only totals using filled and available quantities for the order's own round", () => {
  mount();
  expect(getQuantityLimits(42)).toEqual({
    maxQuantity: 20,
    quantityTick: 0.01,
    priceTick: 0.01,
  });
  expect(mocks.available).toHaveBeenCalledWith("up", 42, symbol);
  expect(getQuantityLimits(999)).toBeUndefined();
});
it("exposes opening totals using the DOWN display price and rounds market ceilings to ticks", () => {
  mount({
    orderChanges: { reduceOnly: false },
    configChanges: { base_tick: 0.05, base_max: 20.039 },
  });
  expect(getQuantityLimits(42)).toEqual({
    maxQuantity: 20,
    quantityTick: 0.05,
    priceTick: 0.01,
  });
  expect(mocks.max).toHaveBeenCalledWith("down", 0.2, symbol);
});
it("edits in UP coordinates and preserves immutable API attributes and reduce-only quantity limits", async () => {
  mount();
  await expect(edit(42, 0.75, 20)).resolves.toBe(true);
  expect(mocks.notify).not.toHaveBeenCalled();
  expect(mocks.update).toHaveBeenCalledWith({
    order_id: 42,
    symbol,
    side: "SELL",
    order_type: "POST_ONLY",
    reduce_only: true,
    client_order_id: "client-42",
    order_tag: "tag",
    order_price: "0.75",
    order_quantity: "20.00",
  });
  expect(mocks.available).toHaveBeenCalledWith("up", 42, symbol);
  await expect(edit(42, 0.75, 21)).resolves.toBe(false);
  expect(mocks.update).toHaveBeenCalledTimes(1);
});
it("still reports failed edits as errors", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  mount();
  mocks.update.mockResolvedValue({ success: false, message: "Edit rejected" });
  await expect(edit(42, 0.75, 20)).resolves.toBe(false);
  expect(mocks.notify).toHaveBeenLastCalledWith("Edit rejected", "danger");
  mocks.update.mockRejectedValue(new Error("Network failure"));
  await expect(edit(42, 0.75, 20)).resolves.toBe(false);
  expect(mocks.notify).toHaveBeenLastCalledWith("Network failure", "danger");
});
it("rejects invalid precision, below-executed totals, restricted regions, expired rounds and disabled accounts", async () => {
  mount();
  await expect(edit(42, 0.751, 20)).resolves.toBe(false);
  await expect(edit(42, 0.75, 9)).resolves.toBe(false);
  act(() => root!.update(<Consumer restricted />));
  await expect(edit(42, 0.75, 20)).resolves.toBe(false);
  act(() => root!.update(<Consumer expired />));
  await expect(edit(42, 0.75, 20)).resolves.toBe(false);
  act(() => root!.update(<Consumer active={false} />));
  await expect(edit(42, 0.75, 20)).resolves.toBe(false);
  expect(mocks.update).not.toHaveBeenCalled();
});
it.each(["account", "disable", "unmount"])(
  "ignores a late edit response after %s changes",
  async (change) => {
    let resolve!: (value: unknown) => void;
    mocks.update.mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    mount();
    const pending = edit(42, 0.75, 20);
    act(() => {
      if (change === "account") root!.update(<Consumer accountId="B" />);
      else if (change === "disable") root!.update(<Consumer active={false} />);
      else root!.unmount();
    });
    resolve({ success: true });
    await expect(pending).resolves.toBe(false);
    expect(mocks.notify).not.toHaveBeenCalled();
  },
);

it.each(["up", "down"] as const)(
  "edits small %s reduce-only orders but rejects small opening orders",
  async (outcome) => {
    const orderChanges = { outcome, filledQuantity: 0, quantity: 1 };
    mount({ orderChanges });
    await expect(edit(42, 0.36, 1)).resolves.toBe(true);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ reduce_only: true, order_quantity: "1.00" }),
    );
    act(() =>
      root!.update(
        <Consumer orderChanges={{ ...orderChanges, reduceOnly: false }} />,
      ),
    );
    await expect(edit(42, 0.36, 1)).resolves.toBe(false);
    expect(mocks.update).toHaveBeenCalledTimes(1);
  },
);
