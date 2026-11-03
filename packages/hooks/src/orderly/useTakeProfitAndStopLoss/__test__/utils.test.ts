// Import AlgoOrderType enum
import { AlgoOrderType, OrderlyOrder, OrderType } from "@orderly.network/types";
// Import functions to be tested
import { OrderSide } from "@orderly.network/types";
import {
  offsetToPrice,
  priceToOffset,
  offsetPercentageToPrice,
  priceToOffsetPercentage,
  pnlToPrice,
  priceToPnl,
  tpslCalculateHelper,
  priceToROI,
} from "../tp_slUtils";

describe("TP/SL Utils function", () => {
  describe("offsetToPrice", () => {
    test("Calculates price correctly for LONG/TAKE_PROFIT type with positive offset", () => {
      const inputs = {
        qty: 0.1,
        offset: 5000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };
      expect(offsetToPrice(inputs)).toBe(71000);
    });
    test("Calculates price correctly for LONG/STOP_LESS type with positive offset", () => {
      const inputs = {
        qty: 0.1,
        offset: 10000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };
      expect(offsetToPrice(inputs)).toBe(56000);
    });

    test("Calculates price correctly for SHORT/TAKE_PROFIT type with negative offset", () => {
      const inputs = {
        qty: -0.1,
        offset: 5000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };
      expect(offsetToPrice(inputs)).toBe(61000);
    });

    test("Calculates price correctly for SHORT/STOP_LOSS type with negative offset", () => {
      const inputs = {
        qty: -0.1,
        offset: 10000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };
      expect(offsetToPrice(inputs)).toBe(76000);
    });
  });

  describe("priceToOffset", () => {
    test("Calculates offset correctly for LONG/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffset(inputs)).toBe(1000);
    });

    test("Calculates offset correctly for LONG/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffset(inputs)).toBe(1000);
    });

    // test("Calculates offset correctly *******", () => {
    //   const inputs = {
    //     qty: 0.1,
    //     price: 1.4774,
    //     entryPrice: 5.4774043,
    //     orderSide: OrderSide.BUY,
    //     orderType: AlgoOrderType.STOP_LOSS,
    //   };

    //   expect(
    //     priceToOffset(inputs, {
    //       symbol: {
    //         quote_dp: 4,
    //       },
    //     })
    //   ).toBe(3000);
    // });

    test("Calculates offset correctly for SHORT/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 63000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffset(inputs)).toBe(3000);
    });

    test("Calculates offset correctly for SHORT/STOP_LOSS type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToOffset(inputs)).toBe(1000);
    });
  });

  describe("offsetPercentageToPrice", () => {
    test("Calculates price correctly for LONG/TAKE_PROFIT type with positive percentage offset", () => {
      const inputs = {
        qty: 0.1,
        percentage: 0.15,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(offsetPercentageToPrice(inputs)).toBe(75900);
    });

    test("Calculates price correctly for LONG/STOP_LOSS type with positive percentage offset", () => {
      const inputs = {
        qty: 0.1,
        percentage: 0.2,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(offsetPercentageToPrice(inputs)).toBe(52800);
    });

    test("Calculates price correctly for SHORT/STOP_LOSS type with positive percentage offset", () => {
      const inputs = {
        qty: -0.1,
        percentage: 0.15,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(offsetPercentageToPrice(inputs)).toBe(56100);
    });

    test("Calculates price correctly for SHORT/STOP_LOSS type with positive percentage offset", () => {
      const inputs = {
        qty: -0.1,
        percentage: 0.2,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(offsetPercentageToPrice(inputs)).toBe(79200);
    });
  });

  describe("priceToOffsetPercentage", () => {
    test("Calculates offset percentage correctly for LONG/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffsetPercentage(inputs)).toBe(0.0152);
    });
    test("Calculates offset percentage correctly for LONG/STOP_LOSS type with target price below entry", () => {
      const inputs = {
        qty: 0.1,
        price: 63000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToOffsetPercentage(inputs)).toBe(0.0455);
    });

    test("Calculates offset percentage correctly for SHORT/TAKE_PROFIT type with target price below entry", () => {
      const inputs = {
        qty: -0.1,
        price: 63000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToOffsetPercentage(inputs)).toBe(0.0455);
    });

    test("Calculates offset percentage correctly for SHORT/STOP_LOSS type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToOffsetPercentage(inputs)).toBe(0.0152);
    });
  });

  describe("pnlToPrice", () => {
    test("Calculates price correctly for LONG/TAKE_PROFIT type with positive pnl", () => {
      const inputs = {
        qty: 0.1,
        pnl: 200,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(pnlToPrice(inputs)).toBe(68000);
    });

    test("Calculates price correctly for LONG/STOP_LOSS type with negative pnl", () => {
      const inputs = {
        qty: 0.1,
        pnl: -500,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(pnlToPrice(inputs)).toBe(61000);
    });

    test("Calculates price correctly for SHORT/TAKE_PROFIT type with positive pnl", () => {
      const inputs = {
        qty: -0.1,
        pnl: 200,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(pnlToPrice(inputs)).toBe(64000);
    });

    test("Calculates price correctly for SHORT/STOP_LOSS type with negative pnl", () => {
      const inputs = {
        qty: -0.1,
        pnl: -500,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(pnlToPrice(inputs)).toBe(71000);
    });
  });

  describe("priceToPnl", () => {
    test("Calculates pnl correctly for LONG/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToPnl(inputs)).toBe(100);
    });

    test("Calculates pnl correctly for LONG/STOP_LOSS type with target price below mark price", () => {
      const inputs = {
        qty: 0.1,
        price: 65000,
        entryPrice: 66000,
        orderSide: OrderSide.BUY,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToPnl(inputs)).toBe(-100);
    });

    test("Calculates pnl correctly for SHORT/TAKE_PROFIT type with target price above mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 65000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.TAKE_PROFIT,
      };

      expect(priceToPnl(inputs)).toBe(100);
    });

    test("Calculates pnl correctly for SHORT/STOP_LOSS type with target price below mark price", () => {
      const inputs = {
        qty: -0.1,
        price: 67000,
        entryPrice: 66000,
        orderSide: OrderSide.SELL,
        orderType: AlgoOrderType.STOP_LOSS,
      };

      expect(priceToPnl(inputs)).toBe(-100);
    });
  });

  describe("TP/SL price inputs", () => {
    const base = {
      entryPrice: 2400,
      markPrice: 2500,
      qty: 2,
      orderSide: OrderSide.BUY,
    };

    describe.each([OrderSide.BUY, OrderSide.SELL])("%s", (orderSide) => {
      describe.each(["tp", "sl"] as const)("%s", (leg) => {
        const direction =
          (orderSide === OrderSide.BUY) === (leg === "tp") ? 1 : -1;
        describe.each([OrderType.MARKET, OrderType.LIMIT])("%s", (type) => {
          describe.each([
            ["offset_percentage", base.entryPrice],
            ["offset_percentage_from_mark", base.markPrice],
          ] as const)("%s", (field, referencePrice) => {
            it.each([2, -2])("round-trips a signed %s%% offset", (percent) => {
              const price = String(
                referencePrice + (direction * referencePrice * percent) / 100,
              );
              const triggerKey = `${leg}_trigger_price` as const;
              const key = `${leg}_${field}`;
              const inputs = {
                ...base,
                qty: orderSide === OrderSide.BUY ? 2 : -2,
                orderSide,
                values: { [`${leg}_order_type`]: type },
              };
              const manual = tpslCalculateHelper(triggerKey, {
                ...inputs,
                key: triggerKey,
                value: price,
              });
              expect(manual[key]).toBe(percent / 100);

              const edited = tpslCalculateHelper(key, {
                ...inputs,
                key,
                value: manual[key],
                values: { ...inputs.values, ...manual },
              });
              expect(edited[triggerKey]).toBe(price);
              if (type === OrderType.LIMIT) {
                expect(edited[`${leg}_order_price`]).toBe(price);
              }
            });
          });

          test.each([
            ["pnl", leg === "tp" ? 96 : -96, 2400 + direction * 48],
            ["offset", 48, 2400 + direction * 48],
            ["offset_percentage", 0.02, 2400 + direction * 48],
            ["offset_from_mark", 50, 2500 + direction * 50],
            ["offset_percentage_from_mark", 0.02, 2500 + direction * 50],
          ])(
            "%s generates the expected price fields",
            (field, value, price) => {
              const key = `${leg}_${field}`;
              const input = {
                ...base,
                qty: orderSide === OrderSide.BUY ? 2 : -2,
                orderSide,
                key,
                value,
                values: {
                  [`${leg}_trigger_price`]: "",
                  [`${leg}_order_type`]: type,
                },
              };
              const changes = tpslCalculateHelper(key, input);
              expect(changes[`${leg}_trigger_price`]).toBe(String(price));
              if (type === OrderType.LIMIT) {
                expect(changes[`${leg}_order_price`]).toBe(String(price));
              } else {
                expect(changes).not.toHaveProperty(`${leg}_order_price`);
              }
            },
          );
        });
      });
    });

    describe.each(["sl_offset_percentage", "sl_offset_percentage_from_mark"])(
      "%s",
      (key) => {
        it.each(["0.02.", "0.02.0", "0.02.00"])(
          "accepts the formatter's %s",
          (value) => {
            const price = key.endsWith("_from_mark") ? "2450" : "2352";
            expect(
              tpslCalculateHelper(key, {
                ...base,
                key,
                value,
                values: {
                  sl_order_type: OrderType.LIMIT,
                  sl_trigger_price: "",
                },
              }),
            ).toMatchObject({ sl_trigger_price: price, sl_order_price: price });
          },
        );
      },
    );

    it("keeps manual prices independent and replaces both on the next offset edit", () => {
      let values: Partial<OrderlyOrder> = {
        sl_order_type: OrderType.LIMIT,
        sl_trigger_price: "",
      };
      const edit = (key: string, value: string | number) => {
        values = {
          ...values,
          ...tpslCalculateHelper(key, { ...base, key, value, values }),
        };
      };

      edit("sl_offset_percentage", 0.02);
      expect(values).toMatchObject({
        sl_trigger_price: "2352",
        sl_order_price: "2352",
      });
      edit("sl_trigger_price", "2360");
      expect(values).toMatchObject({
        sl_trigger_price: "2360",
        sl_order_price: "2352",
      });
      edit("sl_order_price", "2340");
      expect(values).toMatchObject({
        sl_trigger_price: "2360",
        sl_order_price: "2340",
        sl_pnl: -120,
        sl_offset: 40,
        sl_offset_percentage: 0.0167,
        sl_offset_from_mark: 140,
        sl_offset_percentage_from_mark: 0.056,
      });
      const { sl_ROI } = priceToROI({
        values: {
          ...values,
          order_price: "2400",
          side: OrderSide.BUY,
          order_type: OrderType.LIMIT,
        },
        symbolLeverage: 10,
      });
      expect(Number(sl_ROI)).toBeCloseTo(-0.25);
      edit("sl_offset_percentage", 0.03);
      expect(values).toMatchObject({
        sl_trigger_price: "2328",
        sl_order_price: "2328",
      });
      edit("sl_offset_percentage", "");
      expect(values).toMatchObject({
        sl_trigger_price: "",
        sl_order_price: "",
        sl_offset_from_mark: "",
        sl_pnl: "",
      });
    });

    it.each([
      [2333.3333, 0.07],
      [2333.3333, 0.0333],
      [2333.33, 0.015],
    ])(
      "shows a typed %s entry offset of %s after price rounding",
      (entryPrice, percentage) => {
        for (const orderSide of [OrderSide.BUY, OrderSide.SELL]) {
          for (const leg of ["tp", "sl"] as const) {
            for (const type of [OrderType.MARKET, OrderType.LIMIT]) {
              const key = `${leg}_offset_percentage`;
              const result = tpslCalculateHelper(
                key,
                {
                  ...base,
                  entryPrice,
                  markPrice: entryPrice,
                  qty: orderSide === OrderSide.BUY ? 1 : -1,
                  orderSide,
                  key,
                  value: percentage,
                  values: { [`${leg}_order_type`]: type },
                },
                { symbol: { quote_dp: 2 } },
              ) as Record<string, unknown>;
              expect(result[key]).toBe(percentage);
            }
          }
        }
      },
    );
  });
});
