import { useEffect, useRef } from "react";
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
};
let root: ReactTestRenderer | undefined;
let edit: ReturnType<typeof useOrderEditing>["editPendingOrder"];
function Consumer({
  accountId = "A",
  active = true,
  restricted = false,
  expired = false,
}: Props) {
  const mounted = useRef(true);
  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );
  edit = useOrderEditing({
    resources: {
      openOrders: [order],
      accountState: { accountId },
      accountReady: true,
    } as PredictionAccountResources,
    active,
    mounted,
    configBySymbol: new Map([
      [symbol, expired ? { ...config, expire_at: 0 } : config],
    ]),
    isRegionRestricted: restricted,
    notify: mocks.notify,
    availableQuantity: mocks.available,
    maxOpeningQuantity: mocks.max,
  }).editPendingOrder;
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
});

it("edits in UP coordinates and preserves immutable API attributes and reduce-only quantity limits", async () => {
  mount();
  await expect(edit(42, 0.75, 20)).resolves.toBe(true);
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
