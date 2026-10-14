import React from "react";
import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { PendingValue } from "@orderly.network/prediction/src/prediction/dataPanels/orders/pendingValue.ui";
import { PredictionOrderCell } from "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrderCell.ui";
import type {
  PredictionAccountActions,
  PredictionOpenOrder,
} from "@orderly.network/prediction/src/prediction/prediction.types";

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/predictionShared",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    usePredictionFormatters: () => ({}),
  }),
);
vi.mock("@orderly.network/ui", async () => {
  const { Numeral } =
    await import("@orderly.network/ui/src/typography/numeral");
  const { FormattedText } =
    await import("@orderly.network/ui/src/typography/formatted");
  const { parseNumber } =
    await import("@orderly.network/ui/src/typography/utils");
  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  );
  return {
    Text: Object.assign(wrapper, {
      numeral: Numeral,
      formatted: FormattedText,
    }),
    parseNumber,
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
    Button: ({
      children,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
    Input: ({
      value,
      onValueChange,
    }: {
      value: string;
      onValueChange: (value: string) => void;
    }) => (
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    ),
    PopoverRoot: ({
      children,
      open,
    }: {
      children?: React.ReactNode;
      open: boolean;
    }) => <div data-open={open}>{children}</div>,
    PopoverTrigger: wrapper,
    PopoverAnchor: wrapper,
    PopoverContent: wrapper,
  };
});
vi.mock("@orderly.network/ui-orders", () => ({
  EditableCellInput: () => null,
  OrderEditConfirmation: () => null,
}));

const order: PredictionOpenOrder = {
  id: 7,
  symbol: "PERP_BTC5M2701011200_USDC",
  outcome: "down",
  side: "sell",
  type: "limit",
  orderType: "LIMIT",
  reduceOnly: false,
  price: 0.55,
  quantity: 13.93,
  filledQuantity: 2.25,
  averagePrice: 0.55,
  timestamp: new Date(2026, 9, 13, 11, 57, 20).getTime(),
  round: 0,
  status: "partialFilled",
};
const state = {
  isRegionRestricted: false,
  isOrderTradable: () => true,
  editPendingOrder: vi.fn(async () => true),
  cancelOrder: vi.fn(),
} as unknown as PredictionAccountActions & { isRegionRestricted: boolean };

let root: ReactTestRenderer;
function mount(element: React.ReactElement) {
  act(() => {
    root = create(element);
  });
  return root;
}
function visibleText(node: ReturnType<ReactTestRenderer["toJSON"]>): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(visibleText).join("");
  return (node.children ?? []).map(visibleText).join("");
}
function instanceText(node: ReactTestInstance | string): string {
  return typeof node === "string"
    ? node
    : node.children.map(instanceText).join("");
}
afterEach(() => {
  act(() => root?.unmount());
  vi.clearAllMocks();
});

it.each([
  ["notional", { quantity: 10 }, "4.50"],
  ["notional", { quantity: 3000 }, "1,350.00"],
  ["executed", {}, "1.01"],
  ["notional", { status: "filled" }, "1.01"],
] as const)(
  "formats %s as a PERP-style amount without a currency suffix (%j)",
  (field, changes, expected) => {
    mount(
      <PredictionOrderCell
        state={state}
        order={{ ...order, ...changes }}
        field={field}
      />,
    );
    expect(visibleText(root.toJSON())).toBe(expected);
  },
);

it("renders order time in the same local date format as PERP", () => {
  mount(
    <PredictionOrderCell state={state} order={order} field="created_time" />,
  );
  expect(visibleText(root.toJSON())).toBe("2026-10-13 11:57:20");
});

it("keeps filled quantity outside the editable total quantity", () => {
  mount(<PendingValue state={state} order={order} field="quantity" />);
  const trigger = root.root.findAllByType("button")[0];
  expect(instanceText(trigger)).toBe("13.93");
  expect(instanceText(root.root.findAllByType("div")[1])).toBe("2.25 / 13.93");
  expect(trigger.props.className).toContain("oui-border-line-12");
  expect(trigger.props.disabled).toBe(false);
});

it("renders the DOWN price in the editable preview", () => {
  mount(<PendingValue state={state} order={order} field="price" />);
  const trigger = root.root.findAllByType("button")[0];
  expect(instanceText(trigger)).toBe("0.45");
  expect(trigger.props.className).toContain("oui-border-line-12");
});
