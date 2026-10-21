import { API, OrderType } from "@orderly.network/types";
import {
  createTPSLOrderUpdates,
  sanitizeTPSLChildUpdates,
} from "../tpslOrderUpdates";

const bracket = { algo_order_id: 1, algo_type: "BRACKET" } as API.AlgoOrder;
const makeParent = (
  algoType = "TP_SL",
  leg = "TAKE_PROFIT",
  type = OrderType.MARKET,
) =>
  ({
    algo_order_id: 10,
    algo_type: algoType,
    child_orders: [
      {
        algo_order_id: 11,
        algo_type: leg,
        type,
        is_activated: false,
        trigger_price: 4100,
        price: 4110,
      },
    ],
  }) as API.AlgoOrder;

const builders = {
  form: (
    parent: API.AlgoOrder,
    type: OrderType,
    trigger: number | string | undefined,
    ancestor?: API.AlgoOrder,
  ) =>
    createTPSLOrderUpdates(
      [
        {
          algo_type: parent.child_orders[0].algo_type,
          type,
          trigger_price: trigger,
          price: 4120,
        },
      ],
      parent,
      undefined,
      [],
      ancestor,
    ),
  sdk: (
    parent: API.AlgoOrder,
    type: OrderType,
    trigger: number | string | undefined,
    ancestor?: API.AlgoOrder,
  ) =>
    sanitizeTPSLChildUpdates(
      [{ order_id: 11, type, trigger_price: trigger, price: 4120 }],
      parent,
      ancestor,
    ),
};

describe.each(Object.entries(builders))(
  "TP/SL edit policy: %s",
  (_name, update) => {
    it.each(["TAKE_PROFIT", "STOP_LOSS"])(
      "blocks both directions for pending Bracket %s",
      (leg) => {
        for (const oldType of [OrderType.MARKET, OrderType.LIMIT]) {
          const nextType =
            oldType === OrderType.LIMIT ? OrderType.MARKET : OrderType.LIMIT;
          const parent = makeParent("TP_SL", leg, oldType);
          expect(() => update(parent, nextType, 4105, bracket)).toThrow(/type/);
          expect(() =>
            update(
              { ...parent, parent_algo_type: "BRACKET" as any },
              nextType,
              4105,
            ),
          ).toThrow(/type/);
          expect(() =>
            update({ ...parent, parent_algo_order_id: 1 }, nextType, 4105),
          ).toThrow(/type/);
          expect(() =>
            update({ ...parent, root_algo_order_id: 1 }, nextType, 4105),
          ).toThrow(/type/);
        }
      },
    );

    it.each(["TP_SL", "POSITIONAL_TP_SL"])(
      "permits independent %s placeholder activation",
      (algoType) => {
        for (const oldType of [OrderType.MARKET, OrderType.LIMIT]) {
          const nextType =
            oldType === OrderType.LIMIT ? OrderType.MARKET : OrderType.LIMIT;
          const result = update(
            makeParent(algoType, "TAKE_PROFIT", oldType),
            nextType,
            "4105",
          );
          expect(result).toEqual([
            {
              order_id: 11,
              order_type:
                nextType === OrderType.MARKET && algoType === "POSITIONAL_TP_SL"
                  ? OrderType.CLOSE_POSITION
                  : nextType,
              trigger_price: 4105,
              ...(nextType === OrderType.LIMIT ? { price: 4120 } : {}),
            },
          ]);
        }
      },
    );

    it("allows activated nested partial parents but rejects nested positional parents", () => {
      const parent = { ...makeParent(), is_activated: true };
      expect(update(parent, OrderType.LIMIT, 4105, bracket)).toHaveLength(1);
      expect(() =>
        update(
          { ...parent, algo_type: "POSITIONAL_TP_SL" },
          OrderType.LIMIT,
          4105,
          bracket,
        ),
      ).toThrow(/type/);
    });

    it.each([undefined, "", 0, -1, NaN, Infinity, 4100, "4100.00"])(
      "rejects a type change with trigger %s",
      (trigger) => {
        expect(() => update(makeParent(), OrderType.LIMIT, trigger)).toThrow(
          /trigger price/,
        );
      },
    );

    it.each([
      { is_activated: true },
      { is_activated: undefined },
      { is_triggered: true },
      { algo_status: "FILLED" },
      { algo_status: "CANCELLED" },
      { status: "REJECTED" },
    ])("rejects an ineligible leg %j", (state) => {
      const parent = makeParent();
      Object.assign(parent.child_orders[0], state);
      expect(() => update(parent, OrderType.LIMIT, 4105)).toThrow(/type/);
    });

    it("preserves same-type edits and same-trigger activation under a pending Bracket", () => {
      expect(update(makeParent(), OrderType.MARKET, 4100, bracket)).toEqual([
        { order_id: 11, trigger_price: 4100 },
      ]);
      expect(
        update(
          makeParent("TP_SL", "STOP_LOSS", OrderType.LIMIT),
          OrderType.LIMIT,
          4100,
          bracket,
        ),
      ).toEqual([{ order_id: 11, trigger_price: 4100, price: 4120 }]);
    });
  },
);

it("retains the ancestor in nested SDK updates without provenance fields", () => {
  const parent = makeParent();
  const root = { ...bracket, child_orders: [parent] };
  const changes = [
    {
      order_id: 10,
      child_orders: [
        {
          order_id: 11,
          type: OrderType.LIMIT,
          trigger_price: 4105,
          price: 4120,
        },
      ],
    },
  ];
  expect(() => sanitizeTPSLChildUpdates(changes, root)).toThrow(/type/);
  parent.is_activated = true;
  expect(sanitizeTPSLChildUpdates(changes, root)).toEqual([
    {
      order_id: 10,
      child_orders: [
        {
          order_id: 11,
          order_type: OrderType.LIMIT,
          trigger_price: 4105,
          price: 4120,
        },
      ],
    },
  ]);
});
