import React from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { PendingValue } from "@orderly.network/prediction/src/prediction/dataPanels/orders/pendingValue.ui";
import type {
  PredictionAccountActions,
  PredictionOpenOrder,
} from "@orderly.network/prediction/src/prediction/prediction.types";

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({
    i18nKey,
    values,
  }: {
    i18nKey: string;
    values: { value: string };
  }) => (
    <span>
      {i18nKey}: {values.value}
    </span>
  ),
}));
vi.mock("@orderly.network/prediction/src/prediction/cells", () => ({
  TableNumber: ({ value }: { value: number }) => <span>{value}</span>,
}));
vi.mock("@orderly.network/ui", async () => {
  const { forwardRef } = await import("react");
  type MockInputProps = {
    value: string;
    autoFocus?: boolean;
    onValueChange: (value: string) => void;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    onClick?: React.MouseEventHandler<HTMLInputElement>;
    suffix?: React.ReactNode;
  };
  const InputBase = forwardRef<HTMLInputElement, MockInputProps>(
    (props, ref) => (
      <div>
        <input
          ref={ref}
          value={props.value}
          autoFocus={props.autoFocus}
          onChange={(event) => props.onValueChange(event.target.value)}
          onKeyDown={props.onKeyDown}
          onClick={props.onClick}
        />
        {props.suffix}
      </div>
    ),
  );
  const Input = Object.assign(InputBase, { tooltip: InputBase });
  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  );
  const Button = ({
    children,
    loading,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => (
    <button {...props} disabled={props.disabled || loading}>
      {children}
    </button>
  );
  return {
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
    Input,
    inputFormatter: {
      numberFormatter: vi.fn(),
      decimalPointFormatter: vi.fn(),
    },
    Flex: wrapper,
    CheckIcon: () => <span>check</span>,
    CloseIcon: () => <span>close</span>,
    Button,
    ThrottledButton: Button,
    Text: {
      numeral: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
      ),
    },
    Slider: ({
      value,
      onValueChange,
    }: {
      value: number[];
      onValueChange: (value: number[]) => void;
    }) => (
      <div
        role="slider"
        data-slider-value={value[0]}
        onClick={() => onValueChange([50])}
      />
    ),
    toast: { error: vi.fn() },
    PopoverRoot: ({
      children,
      open,
    }: {
      children?: React.ReactNode;
      open: boolean;
    }) => <div data-open={open}>{children}</div>,
    PopoverAnchor: wrapper,
    PopoverContent: ({
      children,
      "data-testid": testId,
    }: {
      children?: React.ReactNode;
      "data-testid"?: string;
    }) => (
      <div data-testid={testId} data-confirmation={testId ? undefined : true}>
        {children}
      </div>
    ),
  };
});
// Exercise the shared PERP input and confirmation components, with only DOM
// primitives mocked so the state transitions remain real.
vi.mock("@orderly.network/ui-orders", async () => ({
  ...(await import("@orderly.network/ui-orders/src/components/orderList/desktop/components/editableCellInput")),
  ...(await import("@orderly.network/ui-orders/src/components/orderList/desktop/editOrder/orderEditConfirmation")),
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
  timestamp: 0,
  round: 0,
};
const state = {
  isRegionRestricted: false,
  isOrderTradable: () => true,
  editPendingOrder: vi.fn(async () => true),
  getOrderEditQuantityLimits: () => ({
    maxQuantity: 20.02,
    quantityTick: 0.01,
  }),
} as unknown as PredictionAccountActions & { isRegionRestricted: boolean };
let root: ReactTestRenderer;
const previewFocus = vi.fn();
const event = () => ({ stopPropagation: vi.fn(), preventDefault: vi.fn() });
function mount(
  field: "price" | "quantity" = "price",
  nextState: typeof state = state,
) {
  act(() => {
    root = create(
      <PendingValue state={nextState} order={order} field={field} />,
      {
        createNodeMock: (element) =>
          element.type === "button"
            ? { focus: previewFocus }
            : element.type === "input"
              ? {
                  value: String(element.props.value),
                  setSelectionRange: () => {},
                }
              : null,
      },
    );
  });
}
function startEditing() {
  act(() => root.root.findByType("button").props.onClick(event()));
}
function changeValue(value: string) {
  act(() =>
    root.root.findByType("input").props.onChange({ target: { value } }),
  );
}
function pressKey(key: string) {
  act(() => root.root.findByType("input").props.onKeyDown({ ...event(), key }));
}
function clickCheck() {
  act(() => root.root.findAllByType("button")[0].props.onClick(event()));
}
function confirmationButton(label: string) {
  return root.root
    .findAllByType("button")
    .find((node) => node.children.includes(label))!;
}
function confirmationIsOpen() {
  return root.root
    .findAllByType("div")
    .some((node) => node.props["data-confirmation"] !== undefined);
}
afterEach(() => {
  act(() => root?.unmount());
  vi.resetAllMocks();
  vi.mocked(state.editPendingOrder).mockResolvedValue(true);
});

it("does not calculate quantity limits while previewing or confirming", () => {
  const getLimits = vi.fn(() => ({ maxQuantity: 20.02, quantityTick: 0.01 }));
  const nextState = { ...state, getOrderEditQuantityLimits: getLimits };
  mount("quantity", nextState);
  act(() =>
    root.update(
      <PendingValue
        state={nextState}
        order={{ ...order, filledQuantity: 3 }}
        field="quantity"
      />,
    ),
  );
  expect(getLimits).not.toHaveBeenCalled();
  startEditing();
  expect(getLimits).toHaveBeenCalledWith(order.id);
  changeValue("15");
  getLimits.mockClear();
  pressKey("Enter");
  expect(confirmationIsOpen()).toBe(true);
  expect(getLimits).not.toHaveBeenCalled();
  act(() => confirmationButton("common.cancel").props.onClick(event()));
  expect(getLimits).not.toHaveBeenCalled();
});
it("refreshes quantity limits while editing when account data changes", () => {
  const getLimits = vi.fn(() => ({ maxQuantity: 20.02, quantityTick: 0.01 }));
  const nextState = { ...state, getOrderEditQuantityLimits: getLimits };
  mount("quantity", nextState);
  startEditing();
  getLimits.mockReturnValue({ maxQuantity: 10, quantityTick: 0.01 });
  act(() =>
    root.update(
      <PendingValue state={nextState} order={order} field="quantity" />,
    ),
  );
  act(() => confirmationButton("common.max").props.onClick());
  expect(root.root.findByType("input").props.value).toBe("10");
});

it.each(["price", "quantity"] as const)(
  "opens %s inline without confirmation or order submission",
  (field) => {
    mount(field);
    startEditing();
    expect(root.root.findByType("input").props.autoFocus).toBe(true);
    expect(root.root.findByType("input").props.value).toBe(
      field === "price" ? "0.45" : "13.93",
    );
    expect(confirmationIsOpen()).toBe(false);
    expect(state.editPendingOrder).not.toHaveBeenCalled();
  },
);
it("opens confirmation with the check button and preserves DOWN coordinates", async () => {
  mount();
  startEditing();
  changeValue("0.3");
  clickCheck();
  expect(confirmationIsOpen()).toBe(true);
  expect(state.editPendingOrder).not.toHaveBeenCalled();
  await act(async () => {
    await confirmationButton("common.confirm").props.onClick(event());
  });
  expect(state.editPendingOrder).toHaveBeenCalledWith(7, 0.7, 13.93);
  expect(root.root.findAllByType("input")).toHaveLength(0);
  expect(confirmationIsOpen()).toBe(false);
});
it.each([
  ["25%", "5"],
  ["50%", "10.01"],
  ["75%", "15.01"],
  ["common.max", "20.02"],
])("sets a tick-aligned total quantity from %s", (label, expected) => {
  mount("quantity");
  startEditing();
  act(() => confirmationButton(label).props.onClick());
  expect(root.root.findByType("input").props.value).toBe(expected);
  expect(confirmationIsOpen()).toBe(false);
  expect(state.editPendingOrder).not.toHaveBeenCalled();
});
it("updates the quantity through the slider", () => {
  mount("quantity");
  startEditing();
  act(() => root.root.findByProps({ role: "slider" }).props.onClick());
  expect(root.root.findByType("input").props.value).toBe("10.01");
  expect(
    root.root.findByProps({ role: "slider" }).props["data-slider-value"],
  ).toBe(50);
});
it.each(["price", "quantity"] as const)(
  "restores the %s preview's focus after Escape",
  (field) => {
    mount(field);
    startEditing();
    changeValue(field === "price" ? "0.3" : "15");
    pressKey("Escape");
    expect(root.root.findAllByType("input")).toHaveLength(0);
    expect(previewFocus).toHaveBeenCalledTimes(1);
  },
);
it("opens quantity confirmation with Enter and submits the total quantity", async () => {
  mount("quantity");
  startEditing();
  changeValue("15");
  pressKey("Enter");
  expect(confirmationIsOpen()).toBe(true);
  await act(async () => {
    await confirmationButton("common.confirm").props.onClick(event());
  });
  expect(state.editPendingOrder).toHaveBeenCalledWith(7, 0.55, 15);
});
it("exits unchanged numeric edits without a confirmation", () => {
  mount();
  startEditing();
  changeValue("0.4500");
  clickCheck();
  expect(confirmationIsOpen()).toBe(false);
  expect(root.root.findAllByType("input")).toHaveLength(0);
  expect(state.editPendingOrder).not.toHaveBeenCalled();
});
it.each(["", "0", "1", "NaN"])(
  "does not confirm an invalid price %s",
  (value) => {
    mount();
    startEditing();
    changeValue(value);
    pressKey("Enter");
    expect(confirmationIsOpen()).toBe(false);
    expect(state.editPendingOrder).not.toHaveBeenCalled();
  },
);
it("rejects a quantity below the already filled quantity", () => {
  mount("quantity");
  startEditing();
  changeValue("2");
  pressKey("Enter");
  expect(confirmationIsOpen()).toBe(false);
  expect(state.editPendingOrder).not.toHaveBeenCalled();
});
it("discards the draft on Escape or cancellation", () => {
  mount();
  startEditing();
  changeValue("0.3");
  pressKey("Escape");
  startEditing();
  expect(root.root.findByType("input").props.value).toBe("0.45");
  changeValue("0.3");
  clickCheck();
  act(() => confirmationButton("common.cancel").props.onClick(event()));
  expect(root.root.findAllByType("input")).toHaveLength(0);
  startEditing();
  expect(root.root.findByType("input").props.value).toBe("0.45");
});
it("keeps the rejected draft inline for correction", async () => {
  vi.mocked(state.editPendingOrder).mockResolvedValue(false);
  mount();
  startEditing();
  changeValue("0.3");
  clickCheck();
  await act(async () => {
    await confirmationButton("common.confirm").props.onClick(event());
  });
  expect(confirmationIsOpen()).toBe(false);
  expect(root.root.findByType("input").props.value).toBe("0.3");
});
it("submits only once and locks cancellation while the request is pending", async () => {
  let resolve!: (result: boolean) => void;
  vi.mocked(state.editPendingOrder).mockImplementation(
    () =>
      new Promise<boolean>((done) => {
        resolve = done;
      }),
  );
  mount();
  startEditing();
  changeValue("0.3");
  clickCheck();
  let pending!: Promise<void>;
  act(() => {
    pending = confirmationButton("common.confirm").props.onClick(event());
  });
  expect(confirmationButton("common.confirm").props.disabled).toBe(true);
  act(() => confirmationButton("common.cancel").props.onClick(event()));
  expect(confirmationIsOpen()).toBe(true);
  await act(async () => {
    await confirmationButton("common.confirm").props.onClick(event());
    resolve(true);
    await pending;
  });
  expect(state.editPendingOrder).toHaveBeenCalledTimes(1);
});
it("invalidates a draft when the order or its tradability changes", () => {
  mount();
  startEditing();
  changeValue("0.3");
  clickCheck();
  act(() =>
    root.update(
      <PendingValue
        state={state}
        order={{ ...order, price: 0.6 }}
        field="price"
      />,
    ),
  );
  expect(confirmationIsOpen()).toBe(false);
  expect(root.root.findAllByType("input")).toHaveLength(0);
  startEditing();
  expect(root.root.findByType("input").props.value).toBe("0.4");
  act(() =>
    root.update(
      <PendingValue
        state={{ ...state, isOrderTradable: () => false }}
        order={order}
        field="price"
      />,
    ),
  );
  expect(root.root.findByType("button").props.disabled).toBe(true);
  expect(root.root.findAllByType("input")).toHaveLength(0);
});
