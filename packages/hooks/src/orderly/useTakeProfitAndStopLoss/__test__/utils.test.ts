// Import AlgoOrderType enum
import { AlgoOrderType, OrderlyOrder, OrderType } from "@orderly.network/types";
// Import functions to be tested
import { OrderSide } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
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
    it.each([
      [99.132, 68.67144, 68.67, 68.68],
      [82.5, -58.0644, -58.07, -58.07],
    ])(
      "rounds estimates at %s using the requested mode",
      (price, raw, floor, legacy) => {
        const inputs = {
          qty: 7.62,
          price,
          entryPrice: 90.12,
          orderSide: OrderSide.BUY,
          orderType: AlgoOrderType.TAKE_PROFIT,
        };
        expect(priceToPnl(inputs)).toBe(raw);
        expect(
          priceToPnl(inputs, { pnlRoundingMode: Decimal.ROUND_FLOOR }),
        ).toBe(floor);
        expect(priceToPnl(inputs, { symbol: { quote_dp: 3 } })).toBe(legacy);
      },
    );

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
            ["offset", base.entryPrice, 1],
            ["offset_from_mark", base.markPrice, 1],
            ["offset_percentage", base.entryPrice, base.entryPrice],
            ["offset_percentage_from_mark", base.markPrice, base.markPrice],
          ] as const)("%s", (field, referencePrice, scale) => {
            it.each([2, -2])("round-trips a signed offset of %s", (offset) => {
              const value = scale === 1 ? offset : offset / 100;
              const price = String(referencePrice + direction * scale * value);
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
              expect(manual[key]).toBe(value);

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
      [105.005, "100", 2, 5],
      [105.005, "110", 2, -5],
      [100.005, "100", 2, 0],
      [0.000000219, "0.00000020", 8, 0.00000001],
    ])(
      "round-trips mark %s and trigger %s at %s decimals with offset %s",
      (markPrice, trigger, quoteDP, offset) => {
        const options = { symbol: { quote_dp: quoteDP } };
        const inputs = {
          ...base,
          markPrice,
          values: { sl_order_type: OrderType.LIMIT },
        };
        const manual = tpslCalculateHelper(
          "sl_trigger_price",
          { ...inputs, key: "sl_trigger_price", value: trigger },
          options,
        );
        expect(manual.sl_offset_from_mark).toBe(offset);

        const key = "sl_offset_from_mark";
        const edited = tpslCalculateHelper(
          key,
          {
            ...inputs,
            key,
            value: String(offset),
            values: { ...inputs.values, ...manual },
          },
          options,
        );
        expect(Number(edited.sl_trigger_price)).toBe(Number(trigger));
        expect(Number(edited.sl_order_price)).toBe(Number(trigger));
        expect(edited.sl_offset_from_mark).toBe(offset);
      },
    );

    it("sets the entry price for a zero amount and clears prices for an empty amount", () => {
      const key = "sl_offset";
      const inputs = {
        ...base,
        key,
        values: {
          sl_order_type: OrderType.LIMIT,
          sl_trigger_price: "2350",
          sl_order_price: "2340",
        },
      };
      const result = tpslCalculateHelper(key, { ...inputs, value: "0" });
      expect(result).toMatchObject({
        sl_trigger_price: "2400",
        sl_order_price: "2400",
        sl_offset: 0,
      });
      expect(tpslCalculateHelper(key, { ...inputs, value: "" })).toMatchObject({
        sl_trigger_price: "",
        sl_order_price: "",
        sl_offset: "",
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
