import { API, OrderType } from "@orderly.network/types";
import {
  createTPSLOrderUpdates,
  sanitizeTPSLChildUpdates,
  TPSLChildUpdate,
} from "../tpslOrderUpdates";

const bracket = { algo_order_id: 1, algo_type: "BRACKET" } as API.AlgoOrder;
const makeParent = (algoType: string, type: OrderType) =>
  ({
    algo_order_id: 10,
    algo_type: algoType,
    is_activated: false,
    child_orders: [
      {
        algo_order_id: 11,
        algo_type: "TAKE_PROFIT",
        type,
        is_activated: false,
        trigger_price: 4100,
        price: 4110,
      },
      {
        algo_order_id: 12,
        algo_type: "STOP_LOSS",
        type,
        is_activated: false,
        trigger_price: 3900,
        price: 3890,
      },
    ],
  }) as API.AlgoOrder;

type Change = TPSLChildUpdate & { algo_type: string; type: OrderType };
const inputs = (parent: API.AlgoOrder): Change[] =>
  parent.child_orders.map((child) => ({
    order_id: child.algo_order_id,
    algo_type: child.algo_type,
    type: child.type,
    is_activated: true,
    trigger_price: child.trigger_price,
    price: child.price,
  }));
const builders = {
  form: (changes: Change[], parent: API.AlgoOrder) =>
    createTPSLOrderUpdates(changes, parent, undefined, [], bracket),
  sdk: (changes: Change[], parent: API.AlgoOrder) =>
    sanitizeTPSLChildUpdates(changes, parent, bracket),
  nested: (changes: Change[], parent: API.AlgoOrder) => {
    const result = sanitizeTPSLChildUpdates(
      [{ order_id: 10, child_orders: changes }],
      { ...bracket, child_orders: [parent] },
    );
    return result[0]?.child_orders ?? [];
  },
};

describe.each(Object.entries(builders))(
  "Configured pending TP/SL: %s",
  (_entry, update) => {
    describe.each(["TP_SL", "POSITIONAL_TP_SL"])("%s parent", (algoType) => {
      it.each([OrderType.MARKET, OrderType.LIMIT])(
        "skips unchanged %s legs, including equivalent numeric strings",
        (type) => {
          const parent = makeParent(algoType, type);
          const changes = inputs(parent).map((child) => ({
            ...child,
            trigger_price: `${child.trigger_price}.00`,
            price: `${child.price}.00`,
          }));
          expect(update(changes, parent)).toEqual([]);
        },
      );

      it.each([OrderType.MARKET, OrderType.LIMIT])(
        "only submits the changed %s trigger",
        (type) => {
          for (const index of [0, 1]) {
            const parent = makeParent(algoType, type);
            const changes = inputs(parent);
            changes[index].trigger_price = index === 0 ? 4105 : 3905;
            expect(update(changes, parent)).toEqual([
              {
                order_id: index + 11,
                trigger_price: changes[index].trigger_price,
              },
            ]);
          }
        },
      );

      it("only submits the changed Limit price", () => {
        for (const index of [0, 1]) {
          const parent = makeParent(algoType, OrderType.LIMIT);
          const changes = inputs(parent);
          changes[index].price = index === 0 ? 4120 : 3880;
          expect(update(changes, parent)).toEqual([
            { order_id: index + 11, price: changes[index].price },
          ]);
        }
      });

      it.each([OrderType.MARKET, OrderType.LIMIT])(
        "explicitly removes a cleared configured %s leg without updating its sibling",
        (type) => {
          for (const index of [0, 1]) {
            const parent = makeParent(algoType, type);
            const changes = inputs(parent);
            // Cancellation must discard any leftover price/type/quantity fields.
            Object.assign(changes[index], {
              is_activated: false,
              trigger_price: "",
              quantity: 999,
            });
            expect(update(changes, parent)).toEqual([
              { order_id: index + 11, is_activated: false },
            ]);
          }
        },
      );

      it("removes both configured legs when both are cleared", () => {
        const parent = makeParent(algoType, OrderType.MARKET);
        expect(
          update(
            inputs(parent).map((child) => ({ ...child, is_activated: false })),
            parent,
          ),
        ).toEqual([
          { order_id: 11, is_activated: false },
          { order_id: 12, is_activated: false },
        ]);
      });

      it("does not cancel an empty pending placeholder", () => {
        const parent = makeParent(algoType, OrderType.MARKET);
        parent.child_orders[0].trigger_price = 0;
        const changes = inputs(parent);
        changes[0].is_activated = false;
        changes[1].trigger_price = 3905;
        expect(update(changes, parent)).toEqual([
          { order_id: 12, trigger_price: 3905 },
        ]);
      });

      it("can enable an empty pending placeholder with its configured type", () => {
        const parent = makeParent(algoType, OrderType.MARKET);
        parent.child_orders[0].trigger_price = 0;
        const changes = inputs(parent);
        changes[0].trigger_price = 4105;
        expect(update(changes, parent)).toEqual([
          { order_id: 11, trigger_price: 4105 },
        ]);
      });
    });

    it("keeps same-trigger placeholder activation after the parent is activated", () => {
      const parent = {
        ...makeParent("TP_SL", OrderType.MARKET),
        is_activated: true,
      };
      expect(update([inputs(parent)[0]], parent)).toEqual([
        { order_id: 11, trigger_price: 4100 },
      ]);
    });

    it("keeps legitimate placeholder type selection after the parent is activated", () => {
      const parent = {
        ...makeParent("TP_SL", OrderType.MARKET),
        is_activated: true,
      };
      expect(
        update(
          [
            {
              ...inputs(parent)[0],
              type: OrderType.LIMIT,
              trigger_price: 4105,
            },
          ],
          parent,
        ),
      ).toEqual([
        {
          order_id: 11,
          order_type: OrderType.LIMIT,
          trigger_price: 4105,
          price: 4110,
        },
      ]);
    });
  },
);

it("preserves standalone inactive-parent placeholder reactivation", () => {
  const parent = makeParent("TP_SL", OrderType.MARKET);
  expect(createTPSLOrderUpdates([inputs(parent)[0]], parent)).toEqual([
    { order_id: 11, trigger_price: 4100 },
  ]);
  expect(sanitizeTPSLChildUpdates([inputs(parent)[0]], parent)).toEqual([
    { order_id: 11, trigger_price: 4100 },
  ]);
});

it("supports explicit removal when the form creator omits a cleared pending leg", () => {
  const parent = {
    ...makeParent("TP_SL", OrderType.MARKET),
    parent_algo_type: "BRACKET",
  } as API.AlgoOrder;
  expect(
    createTPSLOrderUpdates([inputs(parent)[1]], parent, undefined, [
      "TAKE_PROFIT",
    ]),
  ).toEqual([{ order_id: 11, is_activated: false }]);
});
