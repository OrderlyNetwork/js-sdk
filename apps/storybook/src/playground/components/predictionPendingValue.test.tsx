import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { PendingValue } from "@orderly.network/prediction/src/prediction/dataPanels/orders/pendingValue.ui";
import type { PredictionAccountActions } from "@orderly.network/prediction/src/prediction/prediction.types";
import type { API } from "@orderly.network/types";

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", async () => {
  const { createElement, Fragment } = await import("react");
  const wrapper = ({ children }: { children?: React.ReactNode }) =>
    createElement(Fragment, null, children);
  return {
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
    Button: ({
      children,
      disabled,
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
      createElement("button", { disabled }, children),
    Input: () => null,
    PopoverRoot: wrapper,
    PopoverAnchor: wrapper,
    PopoverTrigger: wrapper,
    PopoverContent: wrapper,
  };
});
vi.mock("@orderly.network/ui-orders", () => ({
  EditableCellInput: () => null,
  OrderEditConfirmation: () => null,
}));
vi.mock("@orderly.network/prediction/src/prediction/cells", () => ({
  TableNumber: () => null,
}));

type State = PredictionAccountActions & { isRegionRestricted: boolean };
// OR-7465: the edit gate must follow the order's own round, not the round the
// chart is viewing. symbolB stays tradable while the chart sits on closed A.
const symbolA = "PERP_BTC5M2601011200_USDC";
const symbolB = "PERP_BTC5M2701011200_USDC";
const order = {
  order_id: 7,
  symbol: symbolB,
  side: "BUY",
  type: "LIMIT",
  client_order_id: "client-7",
  order_tag: "tag",
  reduce_only: false,
  price: 0.4,
  quantity: 10,
  total_executed_quantity: 0,
  created_time: 0,
} as API.Order;
function makeState(
  isOrderTradable: (symbol?: string) => boolean,
  isRegionRestricted = false,
): State {
  return {
    isRegionRestricted,
    isOrderTradable,
    editPendingOrder: vi.fn(async () => true),
    cancelOrder: vi.fn(),
  } as unknown as State;
}

let root: ReactTestRenderer | undefined;
// Each PendingValue renders trigger + popover buttons; the trigger is first.
function mountTrigger(state: State, field: "price" | "quantity") {
  if (root) act(() => root!.unmount());
  act(() => {
    root = create(<PendingValue state={state} order={order} field={field} />);
  });
  return root!.root.findAllByType("button")[0];
}
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it("keeps a round-B order editable while the chart views a closed round A", () => {
  const state = makeState((symbol) =>
    symbol === symbolA ? false : symbol === symbolB,
  );
  expect(mountTrigger(state, "price").props.disabled).toBe(false);
  expect(mountTrigger(state, "quantity").props.disabled).toBe(false);
});
it("disables editing once the order's own round closes", () => {
  const state = makeState(() => false);
  expect(mountTrigger(state, "price").props.disabled).toBe(true);
});
it("disables editing in restricted regions even on tradable rounds", () => {
  const state = makeState((symbol) => symbol === symbolB, true);
  expect(mountTrigger(state, "price").props.disabled).toBe(true);
});
