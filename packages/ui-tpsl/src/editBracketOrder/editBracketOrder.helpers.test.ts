import {
  AlgoOrderRootType,
  AlgoOrderType,
  API,
  OrderType,
} from "@orderly.network/types";
import {
  getBracketTPSLPriceInfo,
  hasBracketTPSLPriceChanged,
} from "./editBracketOrder.helpers";

const createTPSLParent = (overrides: Partial<API.AlgoOrder> = {}) =>
  ({
    algo_order_id: 10,
    algo_type: AlgoOrderRootType.POSITIONAL_TP_SL,
    parent_algo_type: AlgoOrderRootType.BRACKET,
    symbol: "PERP_ETH_USDC",
    child_orders: [
      {
        algo_order_id: 11,
        algo_type: AlgoOrderType.TAKE_PROFIT,
        type: OrderType.MARKET,
        trigger_price: 0,
        is_activated: false,
      },
      {
        algo_order_id: 12,
        algo_type: AlgoOrderType.STOP_LOSS,
        type: OrderType.LIMIT,
        trigger_price: 3900,
        price: 3890,
        is_activated: true,
      },
    ],
    ...overrides,
  }) as API.AlgoOrder;

describe("Bracket TP/SL edit helpers", () => {
  it.each([AlgoOrderRootType.TP_SL, AlgoOrderRootType.POSITIONAL_TP_SL])(
    "restores configured Market prices before the %s parent is activated",
    (algoType) => {
      const parent = createTPSLParent({
        algo_type: algoType,
        is_activated: false,
      });
      parent.child_orders = [
        { ...parent.child_orders[0], trigger_price: 2696.4 },
        {
          ...parent.child_orders[1],
          type: OrderType.MARKET,
          trigger_price: 2206.1,
          is_activated: false,
        },
      ];

      expect(getBracketTPSLPriceInfo(parent)).toEqual({
        tp_trigger_price: "2696.4",
        tp_order_type: OrderType.MARKET,
        tp_order_price: "",
        sl_trigger_price: "2206.1",
        sl_order_type: OrderType.MARKET,
        sl_order_price: "",
      });
      expect(
        parent.child_orders.every((child) => child.is_activated === false),
      ).toBe(true);
    },
  );

  it("restores pending Limit trigger and order prices without mutating the order", () => {
    const parent = createTPSLParent({ is_activated: false });
    parent.child_orders[0] = {
      ...parent.child_orders[0],
      type: OrderType.LIMIT,
      trigger_price: 4100,
      price: 4110,
    };
    parent.child_orders[1].is_activated = false;
    const original = JSON.parse(JSON.stringify(parent));

    expect(getBracketTPSLPriceInfo(parent)).toEqual({
      tp_trigger_price: "4100",
      tp_order_type: OrderType.LIMIT,
      tp_order_price: "4110",
      sl_trigger_price: "3900",
      sl_order_type: OrderType.LIMIT,
      sl_order_price: "3890",
    });
    expect(parent).toEqual(original);
  });

  it("keeps a pending zero-price placeholder and a missing leg empty", () => {
    const parent = createTPSLParent({ is_activated: false });
    parent.child_orders = [parent.child_orders[0]];
    expect(getBracketTPSLPriceInfo(parent)).toMatchObject({
      tp_trigger_price: "",
      tp_order_price: "",
      sl_trigger_price: "",
      sl_order_price: "",
    });
  });

  it("does not restore stale placeholder prices after parent activation", () => {
    const parent = createTPSLParent({ is_activated: true });
    parent.child_orders[0] = {
      ...parent.child_orders[0],
      trigger_price: 4100,
      type: OrderType.LIMIT,
      price: 4110,
    };
    expect(getBracketTPSLPriceInfo(parent)).toMatchObject({
      tp_trigger_price: "",
      tp_order_price: "",
    });
  });

  it.each(["CANCELLED", "FILLED", "REJECTED", "EXPIRED"])(
    "does not restore a completed pending leg (%s)",
    (status) => {
      const parent = createTPSLParent({ is_activated: false });
      parent.child_orders[0] = {
        ...parent.child_orders[0],
        trigger_price: 4100,
        algo_status: status,
      };
      expect(getBracketTPSLPriceInfo(parent).tp_trigger_price).toBe("");
    },
  );

  it("keeps an inactive MARKET placeholder empty", () => {
    expect(getBracketTPSLPriceInfo(createTPSLParent())).toEqual({
      tp_trigger_price: "",
      tp_order_type: OrderType.MARKET,
      tp_order_price: "",
      sl_trigger_price: "3900",
      sl_order_type: OrderType.LIMIT,
      sl_order_price: "3890",
    });
  });

  it("keeps the configured LIMIT type without restoring inactive prices", () => {
    const parent = createTPSLParent();
    parent.child_orders[0] = {
      ...parent.child_orders[0],
      type: OrderType.LIMIT,
      trigger_price: 4100,
      price: 4110,
      is_activated: false,
    };

    expect(getBracketTPSLPriceInfo(parent)).toMatchObject({
      tp_trigger_price: "",
      tp_order_type: OrderType.LIMIT,
      tp_order_price: "",
    });
  });

  it("detects activating and clearing a leg", () => {
    const initial = getBracketTPSLPriceInfo(createTPSLParent());

    expect(hasBracketTPSLPriceChanged(initial, initial)).toBe(false);
    expect(
      hasBracketTPSLPriceChanged(initial, {
        ...initial,
        tp_trigger_price: "4100",
      }),
    ).toBe(true);
    expect(
      hasBracketTPSLPriceChanged(initial, {
        ...initial,
        sl_trigger_price: "",
      }),
    ).toBe(true);
  });

  it("treats equivalent numeric representations and empty values as unchanged", () => {
    const initial = getBracketTPSLPriceInfo(createTPSLParent());

    expect(
      hasBracketTPSLPriceChanged(initial, {
        ...initial,
        tp_trigger_price: undefined,
        tp_order_price: undefined,
        sl_trigger_price: 3900,
        sl_order_price: 3890,
      }),
    ).toBe(false);
  });
});
