import React from "react";
import { act, create, ReactTestRenderer } from "react-test-renderer";
import { API, OrderType } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { TPSLInputRowWidget } from "../components/tpslInputRow";
import { useEditBracketOrder } from "./editBracketOrder.script";
import { EditBracketOrderUI } from "./editBracketOrder.ui";

const mockUpdate = jest.fn().mockResolvedValue({ success: true });
const mockValidate = jest.fn().mockResolvedValue(undefined);
const mockClose = jest.fn();
let mockIsMobile = false;
let state: ReturnType<typeof useEditBracketOrder>;

jest.mock("@orderly.network/hooks", () => ({
  ERROR_MSG_CODES: {},
  createTPSLOrderUpdates: jest.requireActual(
    "@orderly.network/hooks/src/services/orderCreator/tpslOrderUpdates",
  ).createTPSLOrderUpdates,
  useMutation: () => [mockUpdate, {}],
  useMaxQty: () => 10,
  useTpslPriceChecker: () => undefined,
  useOrderEntry: (_symbol: string, options: any) => {
    const React = jest.requireActual("react");
    const [values, set] = React.useState(options.initialOrder);
    return {
      formattedOrder: values,
      setValue: (key: string, value: unknown) =>
        set((old: any) => ({ ...old, [key]: value })),
      setValues: React.useCallback(
        (next: any) => set((old: any) => ({ ...old, ...next })),
        [],
      ),
      helper: { validate: mockValidate },
      metaState: {},
      symbolInfo: { symbol: "PERP_ETH_USDC", quote_dp: 2, base_dp: 4 },
    };
  },
}));
jest.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock("@orderly.network/react-app", () => ({
  useOrderEntryFormErrorMsg: () => ({ getErrorMsg: () => undefined }),
}));
jest.mock("@orderly.network/ui", () => {
  const React = jest.requireActual("react");
  const Container = ({ children }: any) => <>{children}</>;
  return {
    cn: (...args: any[]) => args.filter(Boolean).join(" "),
    Flex: Container,
    ScrollArea: Container,
    Text: Container,
    Divider: () => null,
    DotStatus: () => null,
    ThrottledButton: ({ children, onClick, disabled }: any) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
    useScreen: () => ({ isMobile: mockIsMobile }),
    toast: { error: jest.fn() },
    Select: {
      options: ({ value, disabled, onValueChange, options }: any) => (
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
        >
          {options.map((option: any) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ),
    },
  };
});
jest.mock("../components/orderInfo", () => ({ OrderInfo: () => null }));
jest.mock("../components/pnlInfo", () => ({ PnlInfo: () => null }));
jest.mock("../components/tpslPostionType", () => ({
  TPSLPositionTypeWidget: () => null,
}));
jest.mock("../components/tpslInputRow", () => ({
  TPSLInputRowWidget: (props: any) => {
    const { OrderPriceType } = jest.requireActual(
      "../components/orderPriceType",
    );
    return (
      <OrderPriceType
        type={props.values.order_type}
        disabled={props.disableOrderTypeSelector}
        onChange={(type: OrderType) =>
          props.onChange(`${props.type}_order_type`, type)
        }
      />
    );
  },
}));

const makeOrder = (activated = false, algoType = "TP_SL") =>
  ({
    algo_order_id: 1,
    algo_type: "BRACKET",
    symbol: "PERP_ETH_USDC",
    quantity: 1,
    price: 4000,
    side: "BUY",
    child_orders: [
      {
        algo_order_id: 10,
        algo_type: algoType,
        is_activated: activated,
        child_orders: [
          {
            algo_order_id: 11,
            algo_type: "TAKE_PROFIT",
            type: OrderType.MARKET,
            trigger_price: 4100,
            is_activated: false,
          },
          {
            algo_order_id: 12,
            algo_type: "STOP_LOSS",
            type: OrderType.LIMIT,
            trigger_price: 3900,
            price: 3890,
            is_activated: false,
          },
        ],
      },
    ],
  }) as API.AlgoOrderExt;

const Probe = ({ order }: { order: API.AlgoOrderExt }) => {
  state = useEditBracketOrder({ order });
  return <EditBracketOrderUI {...state} onClose={mockClose} />;
};

describe.each([false, true])("Bracket edit UI (mobile=%s)", (mobile) => {
  let renderer: ReactTestRenderer;
  beforeEach(() => {
    mockIsMobile = mobile;
    jest.clearAllMocks();
  });
  afterEach(() => {
    act(() => renderer?.unmount());
  });

  it("leaves field validation errors to the form without showing a Toast", async () => {
    mockValidate.mockRejectedValueOnce({
      tp_trigger_price: {
        type: "required",
        message: "Trigger price is required",
      },
    });
    act(() => {
      renderer = create(<Probe order={makeOrder()} />);
    });
    act(() => state.setValue("tp_trigger_price", "4105"));
    await act(async () => {
      renderer.root.findByType("button").props.onClick();
    });

    expect(mockValidate).toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockClose).not.toHaveBeenCalled();
  });

  it.each([new Error("Update failed"), { message: "Update failed" }])(
    "shows a valid exception message: %j",
    async (error) => {
      mockUpdate.mockRejectedValueOnce(error);
      act(() => {
        renderer = create(<Probe order={makeOrder()} />);
      });
      act(() => state.setValue("tp_trigger_price", "4105"));
      await act(async () => {
        renderer.root.findByType("button").props.onClick();
      });

      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith("Update failed");
      expect(mockClose).not.toHaveBeenCalled();
    },
  );

  it.each([
    null,
    undefined,
    {},
    { message: "" },
    { message: "   " },
    { message: 42 },
  ])(
    "does not show an empty or invalid exception message: %j",
    async (error) => {
      mockUpdate.mockRejectedValueOnce(error);
      act(() => {
        renderer = create(<Probe order={makeOrder()} />);
      });
      act(() => state.setValue("tp_trigger_price", "4105"));
      await act(async () => {
        renderer.root.findByType("button").props.onClick();
      });

      expect(toast.error).not.toHaveBeenCalled();
      expect(mockClose).not.toHaveBeenCalled();
    },
  );

  it("disables both pending selectors and preserves their server types", () => {
    act(() => {
      renderer = create(<Probe order={makeOrder()} />);
    });
    const selectors = renderer.root.findAllByType("select");
    expect(selectors.map((item) => item.props.disabled)).toEqual([true, true]);
    expect(selectors.map((item) => item.props.value)).toEqual([
      OrderType.MARKET,
      OrderType.LIMIT,
    ]);
    expect(state.formattedOrder).toMatchObject({
      tp_trigger_price: "4100",
      sl_trigger_price: "3900",
      sl_order_price: "3890",
    });
    expect(state.isPriceChanged).toBe(false);
    expect(renderer.root.findByType("button").props.disabled).toBe(true);
  });

  it("fills both Pending Market rows with the configured trigger prices", () => {
    const order = makeOrder();
    order.child_orders[0].child_orders[0].trigger_price = 2696.4;
    order.child_orders[0].child_orders[1].trigger_price = 2206.1;
    order.child_orders[0].child_orders[1].type = OrderType.MARKET;
    act(() => {
      renderer = create(<Probe order={order} />);
    });

    const rows = renderer.root.findAllByType(TPSLInputRowWidget);
    expect(rows.map((row) => row.props.values.trigger_price)).toEqual([
      "2696.4",
      "2206.1",
    ]);
    expect(rows.map((row) => row.props.values.order_price)).toEqual(["", ""]);
    expect(rows.every((row) => row.props.disableOrderTypeSelector)).toBe(true);
    expect(state.isPriceChanged).toBe(false);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("keeps legitimate placeholder selectors available after partial-parent activation", () => {
    act(() => {
      renderer = create(<Probe order={makeOrder(true)} />);
    });
    const selectors = renderer.root.findAllByType("select");
    expect(selectors.map((item) => item.props.disabled)).toEqual([
      false,
      false,
    ]);
    act(() =>
      selectors[0].props.onChange({ target: { value: OrderType.LIMIT } }),
    );
    expect(state.formattedOrder.tp_order_type).toBe(OrderType.LIMIT);
  });

  it("locks nested positional selectors even when their parent is activated", () => {
    act(() => {
      renderer = create(<Probe order={makeOrder(true, "POSITIONAL_TP_SL")} />);
    });
    expect(
      renderer.root.findAllByType("select").map((item) => item.props.disabled),
    ).toEqual([true, true]);
  });

  it("guards forged type changes at submission and permits same-type edits", async () => {
    act(() => {
      renderer = create(<Probe order={makeOrder()} />);
    });
    act(() =>
      state.setValues({
        tp_order_type: OrderType.LIMIT,
        tp_trigger_price: "4105",
        tp_order_price: "4110",
      }),
    );
    await expect(state.onSubmit()).rejects.toThrow(/type/);
    expect(mockUpdate).not.toHaveBeenCalled();
    act(() => state.setValue("tp_order_type", OrderType.MARKET));
    await state.onSubmit();
    expect(mockUpdate).toHaveBeenCalledWith({
      order_id: 1,
      child_orders: [
        {
          order_id: 10,
          child_orders: [{ order_id: 11, trigger_price: 4105 }],
        },
      ],
    });
  });

  it("does not submit unchanged configured pending legs", async () => {
    act(() => {
      renderer = create(<Probe order={makeOrder()} />);
    });
    await state.onSubmit();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it.each(["tp", "sl"] as const)(
    "only submits a changed %s trigger",
    async (leg) => {
      act(() => {
        renderer = create(<Probe order={makeOrder()} />);
      });
      const trigger = leg === "tp" ? "4105" : "3905";
      act(() => state.setValue(`${leg}_trigger_price`, trigger));
      await state.onSubmit();
      expect(mockUpdate).toHaveBeenCalledWith({
        order_id: 1,
        child_orders: [
          {
            order_id: 10,
            child_orders: [
              {
                order_id: leg === "tp" ? 11 : 12,
                trigger_price: Number(trigger),
              },
            ],
          },
        ],
      });
    },
  );

  it("only submits a changed Limit price", async () => {
    act(() => {
      renderer = create(<Probe order={makeOrder()} />);
    });
    act(() => state.setValue("sl_order_price", "3880"));
    await state.onSubmit();
    expect(mockUpdate).toHaveBeenCalledWith({
      order_id: 1,
      child_orders: [
        { order_id: 10, child_orders: [{ order_id: 12, price: 3880 }] },
      ],
    });
  });

  it.each(["tp", "sl"] as const)(
    "explicitly removes a cleared %s without updating its sibling",
    async (leg) => {
      act(() => {
        renderer = create(<Probe order={makeOrder()} />);
      });
      act(() =>
        state.setValues({
          [`${leg}_trigger_price`]: "",
          [`${leg}_order_price`]: "",
        }),
      );
      expect(state.isPriceChanged).toBe(true);
      await state.onSubmit();
      expect(mockUpdate).toHaveBeenCalledWith({
        order_id: 1,
        child_orders: [
          {
            order_id: 10,
            child_orders: [
              { order_id: leg === "tp" ? 11 : 12, is_activated: false },
            ],
          },
        ],
      });
    },
  );

  it("removes both configured pending legs when both are cleared", async () => {
    act(() => {
      renderer = create(<Probe order={makeOrder()} />);
    });
    act(() =>
      state.setValues({
        tp_trigger_price: "",
        tp_order_price: "",
        sl_trigger_price: "",
        sl_order_price: "",
      }),
    );
    await state.onSubmit();
    expect(mockUpdate).toHaveBeenCalledWith({
      order_id: 1,
      child_orders: [
        {
          order_id: 10,
          child_orders: [
            { order_id: 11, is_activated: false },
            { order_id: 12, is_activated: false },
          ],
        },
      ],
    });
  });

  it("keeps legitimate placeholder type selection and activation", async () => {
    act(() => {
      renderer = create(<Probe order={makeOrder(true)} />);
    });
    act(() =>
      state.setValues({
        tp_order_type: OrderType.LIMIT,
        tp_trigger_price: "4105",
        tp_order_price: "4110",
      }),
    );
    await state.onSubmit();
    expect(mockUpdate).toHaveBeenCalledWith({
      order_id: 1,
      child_orders: [
        {
          order_id: 10,
          child_orders: [
            {
              order_id: 11,
              order_type: OrderType.LIMIT,
              trigger_price: 4105,
              price: 4110,
            },
          ],
        },
      ],
    });
  });
});
