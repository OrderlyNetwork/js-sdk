import {
  AlgoOrderRootType,
  AlgoOrderType,
  API,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import { BracketLimitOrderCreator } from "../bracketLimitOrderCreator";
import { BracketMarketOrderCreator } from "../bracketMarketOrderCreator";
import { BracketOrderBuilder } from "../builders/BracketOrderBuilder";
import { TPSLOrderCreator } from "../tpslOrderCreator";
import { sanitizeTPSLChildUpdates } from "../tpslOrderUpdates";
import { TPSLPositionOrderCreator } from "../tpslPositionOrderCreator";
import { createMockConfig, createMockOrderlyOrder } from "./testHelpers";

const creator = new TPSLPositionOrderCreator();
const config = createMockConfig();
const values: any = {
  symbol: "PERP_ETH_USDC",
  side: OrderSide.BUY,
  position_type: PositionType.FULL,
  quantity: "2",
  tp_trigger_price: "4100",
  tp_order_price: "4110",
  tp_order_type: OrderType.LIMIT,
  sl_trigger_price: "3900",
  sl_order_type: OrderType.MARKET,
};
const oldOrder = () =>
  ({
    ...creator.create(values, config),
    algo_order_id: 10,
    child_orders: creator
      .create(values, config)
      .child_orders.map((child, index) => ({
        ...child,
        algo_order_id: index + 11,
      })),
  }) as API.AlgoOrder;

describe("Positional limit creation and compatibility", () => {
  it.each([OrderType.MARKET, OrderType.LIMIT])(
    "serializes independent %s legs without quantities",
    (type) => {
      const result = creator.create(
        { ...values, sl_order_type: type, sl_order_price: "3890" },
        config,
      );
      expect(result).not.toHaveProperty("quantity");
      expect(result.child_orders[0]).toMatchObject({
        type: OrderType.LIMIT,
        price: 4110,
      });
      expect(result.child_orders[1].type).toBe(
        type === OrderType.LIMIT ? OrderType.LIMIT : OrderType.CLOSE_POSITION,
      );
      for (const child of result.child_orders)
        expect(child).not.toHaveProperty("quantity");
      if (type === OrderType.MARKET)
        expect(result.child_orders[1]).not.toHaveProperty("price");
    },
  );
  it("supports legacy price-only calls and ignores explicit market stale prices", async () => {
    expect(
      creator.create({ ...values, tp_order_type: undefined }, config)
        .child_orders[0].type,
    ).toBe(OrderType.LIMIT);
    const market = {
      ...values,
      tp_order_type: OrderType.MARKET,
      tp_order_price: "-100",
    };
    expect(creator.create(market, config).child_orders[0]).toMatchObject({
      type: OrderType.CLOSE_POSITION,
    });
    expect(creator.create(market, config).child_orders[0]).not.toHaveProperty(
      "price",
    );
    expect(await creator.validate(market, config)).toBeNull();
    expect(
      new TPSLOrderCreator().create(
        { ...market, position_type: PositionType.PARTIAL },
        config,
      ).child_orders[0].type,
    ).toBe(OrderType.MARKET);
  });
  it.each([new BracketLimitOrderCreator(), new BracketMarketOrderCreator()])(
    "keeps only Bracket opening quantity",
    (bracket) => {
      const result: any = bracket.create(
        createMockOrderlyOrder({ ...values, order_quantity: "2" }),
        config,
      );
      expect(result.quantity).toBe("2");
      const parent = result.child_orders[0];
      expect(parent.algo_type).toBe(AlgoOrderRootType.POSITIONAL_TP_SL);
      expect(parent).not.toHaveProperty("quantity");
      expect(parent.child_orders[0]).toMatchObject({
        type: OrderType.LIMIT,
        price: "4110",
      });
      expect(parent.child_orders[1]).not.toHaveProperty("price");
      for (const child of parent.child_orders)
        expect(child).not.toHaveProperty("quantity");
    },
  );
  it("fixes the alternative Bracket builder and default full-position market type", () => {
    const builder = new BracketOrderBuilder()
      .withSymbol(values.symbol)
      .withSide(OrderSide.BUY)
      .withQuantity("2")
      .withPositionType(PositionType.FULL)
      .withTPTrigger(4100)
      .withTPOrderPrice(4110)
      .withSLTrigger(3900);
    const parent = builder.build().child_orders[0];
    expect(parent.child_orders.map((child: any) => child.type)).toEqual([
      OrderType.LIMIT,
      OrderType.CLOSE_POSITION,
    ]);
    expect(parent.child_orders[1]).not.toHaveProperty("price");
  });
  it.each(["", "0", "-1", "NaN", "Infinity", "0.001"])(
    "rejects invalid enabled limit price %s",
    async (price) => {
      const result = await creator.validate(
        { ...values, tp_order_price: price },
        config,
      );
      expect(result?.tp_order_price).toBeDefined();
      expect(() =>
        creator.create({ ...values, tp_order_price: price }, config),
      ).toThrow();
    },
  );
  it("ignores inactive limit legs and does not validate full-position estimate quantity", async () => {
    expect(
      await creator.validate(
        {
          ...values,
          tp_trigger_price: "",
          tp_order_price: "",
          quantity: "99999",
        },
        config,
      ),
    ).toBeNull();
  });
  it("preserves the existing price relation, hint direction and protection range", async () => {
    // Long TP: order price below the trigger must hint "set trigger lower"
    expect(
      (await creator.validate({ ...values, tp_order_price: "4099" }, config))
        ?.tp_trigger_price,
    ).toMatchObject({ type: "priceErrorMin" });
    expect(
      (await creator.validate({ ...values, tp_order_price: "9000" }, config))
        ?.tp_order_price,
    ).toBeDefined();
    // Long SL: order price above the trigger must hint "set trigger higher"
    expect(
      (
        await creator.validate(
          {
            ...values,
            tp_trigger_price: undefined,
            sl_order_type: OrderType.LIMIT,
            sl_order_price: "3910",
          },
          config,
        )
      )?.sl_trigger_price,
    ).toMatchObject({ type: "priceErrorMax" });
    // Short TP: trigger below order price keeps the "set trigger higher" hint
    expect(
      (
        await creator.validate(
          {
            ...values,
            side: OrderSide.SELL,
            tp_trigger_price: "3900",
            tp_order_price: "3910",
            sl_trigger_price: undefined,
          },
          config,
        )
      )?.tp_trigger_price,
    ).toMatchObject({ type: "priceErrorMax" });
    // Short SL: order price below the trigger keeps the "set trigger lower" hint
    expect(
      (
        await creator.validate(
          {
            ...values,
            side: OrderSide.SELL,
            tp_trigger_price: undefined,
            sl_trigger_price: "4100",
            sl_order_type: OrderType.LIMIT,
            sl_order_price: "4090",
          },
          config,
        )
      )?.sl_trigger_price,
    ).toMatchObject({ type: "priceErrorMin" });
  });
});

describe("Bracket LIMIT payload boundary", () => {
  const bracketCreators = [
    ["limit", () => new BracketLimitOrderCreator()],
    ["market", () => new BracketMarketOrderCreator()],
  ] as const;
  const legs = ["tp", "sl"] as const;

  const createBracketValues = (
    leg: (typeof legs)[number],
    price: string | number | undefined,
    orderType = OrderType.LIMIT,
  ) =>
    createMockOrderlyOrder({
      position_type: PositionType.FULL,
      order_quantity: "2",
      tp_trigger_price: leg === "tp" ? "4100" : undefined,
      tp_order_type: leg === "tp" ? orderType : undefined,
      tp_order_price: leg === "tp" ? price : undefined,
      sl_trigger_price: leg === "sl" ? "3900" : undefined,
      sl_order_type: leg === "sl" ? orderType : undefined,
      sl_order_price: leg === "sl" ? price : undefined,
    } as any);

  it.each(bracketCreators)(
    "rejects invalid %s Bracket LIMIT prices for TP and SL",
    (_name, createCreator) => {
      for (const leg of legs) {
        for (const price of [
          undefined,
          "",
          0,
          -1,
          Number.NaN,
          Number.POSITIVE_INFINITY,
          "0.001",
        ]) {
          expect(() =>
            createCreator().create(createBracketValues(leg, price), config),
          ).toThrow(/positive finite price/);
        }
      }
    },
  );

  it.each(bracketCreators)(
    "requires config for enabled %s Bracket LIMIT children",
    (_name, createCreator) => {
      expect(() =>
        createCreator().create(createBracketValues("tp", "4110")),
      ).toThrow(/configuration is required/);
    },
  );

  it.each(bracketCreators)(
    "preserves valid %s Bracket LIMIT price values and types",
    (_name, createCreator) => {
      for (const price of ["4110", 4110]) {
        const result: any = createCreator().create(
          createBracketValues("tp", price),
          config,
        );
        expect(result.child_orders[0].child_orders[0]).toMatchObject({
          type: OrderType.LIMIT,
          price,
        });
      }
    },
  );

  it.each(bracketCreators)(
    "ignores stale prices on explicit %s Bracket MARKET children",
    (_name, createCreator) => {
      const result: any = createCreator().create(
        createBracketValues("tp", "-1", OrderType.MARKET),
        config,
      );
      expect(result.child_orders[0].child_orders[0]).toMatchObject({
        type: OrderType.CLOSE_POSITION,
      });
      expect(result.child_orders[0].child_orders[0]).not.toHaveProperty(
        "price",
      );
    },
  );
});

describe("Positional price editing", () => {
  it("sends price-only and combined updates without type or quantity", () => {
    expect(
      creator.crateUpdateOrder(
        { ...values, tp_order_price: "4120" },
        oldOrder(),
        config,
      )[0],
    ).toEqual({
      child_orders: [{ order_id: 11, price: 4120 }],
    });
    expect(
      creator.crateUpdateOrder(
        {
          ...values,
          tp_trigger_price: "4105",
          tp_order_price: "4120",
          quantity: "999",
        },
        oldOrder(),
        config,
      )[0],
    ).toEqual({
      child_orders: [{ order_id: 11, trigger_price: 4105, price: 4120 }],
    });
  });
  it("skips unchanged legs and deactivates without leftover limit fields", () => {
    expect(
      creator.crateUpdateOrder(values, oldOrder(), config)[0].child_orders,
    ).toEqual([]);
    expect(
      creator.crateUpdateOrder(
        { ...values, tp_trigger_price: "", tp_order_price: "" },
        oldOrder(),
        config,
      )[0].child_orders,
    ).toEqual([{ order_id: 11, is_activated: false }]);
  });
  it("reactivates an inactive leg by updating its trigger price", () => {
    const inactiveOrder = oldOrder();
    inactiveOrder.child_orders[1] = {
      ...inactiveOrder.child_orders[1],
      trigger_price: 0,
      is_activated: false,
    };

    expect(
      creator.crateUpdateOrder(values, inactiveOrder, config)[0].child_orders,
    ).toEqual([{ order_id: 12, trigger_price: 3900 }]);
  });
  it("preserves omitted legs and only deactivates explicitly cleared legs", () => {
    expect(
      creator.crateUpdateOrder(
        { ...values, tp_order_price: "4120", sl_trigger_price: undefined },
        oldOrder(),
        config,
      )[0].child_orders,
    ).toEqual([{ order_id: 11, price: 4120 }]);

    const partialCreator = new TPSLOrderCreator();
    const partialValues = {
      ...values,
      position_type: PositionType.PARTIAL,
      quantity: "1",
      tp_order_type: OrderType.LIMIT,
    };
    const partialOld = {
      ...partialCreator.create(partialValues, config),
      algo_order_id: 20,
      child_orders: partialCreator
        .create(partialValues, config)
        .child_orders.map((child, index) => ({
          ...child,
          algo_order_id: index + 21,
        })),
    } as API.AlgoOrder;

    expect(
      partialCreator.crateUpdateOrder(
        { ...partialValues, sl_trigger_price: undefined },
        partialOld,
        config,
      )[0].child_orders,
    ).toEqual([]);
    expect(
      partialCreator.crateUpdateOrder(
        { ...partialValues, sl_trigger_price: "" },
        partialOld,
        config,
      )[0].child_orders,
    ).toEqual([{ order_id: 22, is_activated: false }]);
  });
  it("updates the quantity of omitted active partial legs", () => {
    const partialCreator = new TPSLOrderCreator();
    const partialValues = {
      ...values,
      position_type: PositionType.PARTIAL,
      quantity: "1",
      tp_order_type: OrderType.LIMIT,
    };
    const partialOld = {
      ...partialCreator.create(partialValues, config),
      algo_order_id: 20,
      child_orders: partialCreator
        .create(partialValues, config)
        .child_orders.map((child, index) => ({
          ...child,
          algo_order_id: index + 21,
        })),
    } as API.AlgoOrder;

    expect(
      partialCreator.crateUpdateOrder(
        {
          ...partialValues,
          quantity: "2",
          sl_trigger_price: undefined,
        },
        partialOld,
        config,
      )[0].child_orders,
    ).toEqual([
      { order_id: 21, quantity: 2 },
      { order_id: 22, quantity: 2 },
    ]);
    expect(
      partialCreator.crateUpdateOrder(
        { ...partialValues, quantity: "2", sl_trigger_price: "" },
        partialOld,
        config,
      )[0].child_orders,
    ).toEqual([
      { order_id: 21, quantity: 2 },
      { order_id: 22, is_activated: false },
    ]);
  });
  it("rejects SDK type changes", () => {
    expect(() =>
      creator.crateUpdateOrder(
        { ...values, tp_order_type: OrderType.MARKET },
        oldOrder(),
        config,
      ),
    ).toThrow(/type/);
    expect(() =>
      creator.crateUpdateOrder(
        { ...values, sl_order_type: OrderType.LIMIT, sl_order_price: "3890" },
        oldOrder(),
        config,
      ),
    ).toThrow(/type/);
  });
  it("guards low-level nested updates", () => {
    const parent = oldOrder();
    expect(
      sanitizeTPSLChildUpdates(
        [{ order_id: 11, price: 4120, quantity: 99 }],
        parent,
      ),
    ).toEqual([{ order_id: 11, price: 4120 }]);
    expect(
      sanitizeTPSLChildUpdates(
        [{ order_id: 11, is_activated: false, price: 0, quantity: 99 }],
        parent,
      ),
    ).toEqual([{ order_id: 11, is_activated: false }]);
    expect(() =>
      sanitizeTPSLChildUpdates(
        [{ order_id: 11, type: OrderType.MARKET }],
        parent,
      ),
    ).toThrow(/type/);
    const bracket = {
      child_orders: [parent],
      algo_type: AlgoOrderRootType.BRACKET,
    } as API.AlgoOrder;
    expect(
      sanitizeTPSLChildUpdates(
        [
          {
            order_id: 10,
            child_orders: [{ order_id: 11, price: 4120, quantity: 99 }],
          },
        ],
        bracket,
      ),
    ).toEqual([
      { order_id: 10, child_orders: [{ order_id: 11, price: 4120 }] },
    ]);
  });
});
