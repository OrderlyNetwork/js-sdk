import { OrderSide } from "@veltodefi/types";
import { TPSLOrderCreator } from "../tpslOrderCreator";

describe("tpslOrderCreator", () => {
  let orderCreator: TPSLOrderCreator;

  beforeEach(() => {
    orderCreator = new TPSLOrderCreator();
  });

  describe("validate()", () => {
    test("no values need to validate", async () => {
      const values = {
        side: OrderSide.BUY,
      };
      const config = {
        markPrice: 60,
        symbol: {} as any,
        maxQty: 0,
      };
      const result = await orderCreator.validate(values, config);

      expect(result).toBeNull();
    });
    test('no values need to validate, value is "" ', async () => {
      const values = {
        side: OrderSide.BUY,
        tp_trigger_price: "",
        sl_trigger_price: "",
      };
      const config = {
        markPrice: 60,
        symbol: {} as any,
        maxQty: 0,
      };
      const result = await orderCreator.validate(values, config);

      expect(result).toBeNull();
    });

    test("buy/stop price is less than sell/stop price", async () => {
      const values = {
        tp_trigger_price: 100,
        sl_trigger_price: 70,
        side: OrderSide.BUY,
      };
      const config = {
        markPrice: 60,
        symbol: {} as any,
        maxQty: 0,
      };
      const result = await orderCreator.validate(values, config);

      expect(result).toEqual({
        sl_trigger_price: {
          message: "SL Price must be less than 60",
        },
      });
    });

    test("position side = “BUY” AND algo_type == “TAKE_PROFIT“, trigger_price <= mark_price", async () => {
      const values = {
        tp_trigger_price: 90,
        sl_trigger_price: 70,
        side: OrderSide.BUY,
      };
      const config = {
        markPrice: 100,
        symbol: {} as any,
        maxQty: 0,
      };
      const result = await orderCreator.validate(values, config);

      expect(result).toEqual({
        tp_trigger_price: {
          message: "TP Price must be greater than 100",
        },
      });
    });

    test("position side =”SELL”  AND algo_type == “STOP_LOSS“, trigger_price <= mark_price", async () => {
      const values = {
        // tp_trigger_price: 90,
        sl_trigger_price: 70,
        side: OrderSide.SELL,
      };
      const config = {
        markPrice: 100,
        symbol: {} as any,
        maxQty: 0,
      };
      const result = await orderCreator.validate(values, config);

      expect(result).toEqual({
        sl_trigger_price: {
          message: "SL Price must be greater than 100",
        },
      });
    });
    test("position side =”SELL”  AND algo_type == “STOP_LOSS“, trigger_price <= mark_price", async () => {
      const values = {
        tp_trigger_price: 110,
        // sl_trigger_price: 70,
        side: OrderSide.SELL,
      };
      const config = {
        markPrice: 100,
        symbol: {} as any,
        maxQty: 0,
      };
      const result = await orderCreator.validate(values, config);

      expect(result).toEqual({
        tp_trigger_price: {
          message: "TP Price must be less than 100",
        },
      });
    });

    test("All validate faild: BUY", async () => {
      const values = {
        tp_trigger_price: 90,
        sl_trigger_price: 110,
        side: OrderSide.BUY,
      };
      const config = {
        markPrice: 100,
        symbol: {} as any,
        maxQty: 0,
      };
      const result = await orderCreator.validate(values, config);

      expect(result).toEqual({
        tp_trigger_price: {
          message: "TP Price must be greater than 100",
        },
        sl_trigger_price: {
          message: "SL Price must be less than 100",
        },
      });
    });

    test("All validate faild: SELL", async () => {
      const values = {
        tp_trigger_price: 110,
        sl_trigger_price: 90,
        side: OrderSide.SELL,
      };
      const config = {
        markPrice: 100,
        symbol: {} as any,
        maxQty: 0,
      };
      const result = await orderCreator.validate(values, config);

      expect(result).toEqual({
        tp_trigger_price: {
          message: "TP Price must be less than 100",
        },
        sl_trigger_price: {
          message: "SL Price must be greater than 100",
        },
      });
    });
  });
});
