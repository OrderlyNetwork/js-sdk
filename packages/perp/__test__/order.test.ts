import { expect } from "@jest/globals";
import { estLeverage, estLiqPrice, orderFee } from "../src/order";

describe("order", () => {
  describe("estLeverage", () => {
    it("should calculate the estimated leverage correctly: Market", () => {
      const inputs = {
        totalCollateral: 1981.66,
        positions: [
          {
            symbol: "BTC",
            position_qty: 0.2,
            mark_price: 25986.2,
          },
          {
            symbol: "ETH",
            position_qty: -3,
            mark_price: 1638.41,
          },
        ],
        newOrder: {
          symbol: "BTC",
          qty: 0.1,
          price: 26000,
        },
      };
      expect(estLeverage(inputs)).toBe(6.42);
    });

    it("should calculate the estimated leverage correctly: Limit order 1", () => {
      const inputs = {
        totalCollateral: 1981.66,
        positions: [
          {
            symbol: "BTC",
            position_qty: 0.2,
            mark_price: 25986.2,
          },
          {
            symbol: "ETH",
            position_qty: -3,
            mark_price: 1638.41,
          },
        ],
        newOrder: {
          symbol: "BTC",
          qty: 0.1,
          price: 25000,
        },
      };
      expect(estLeverage(inputs)).toBe(6.36);
    });

    it(" estimated leverage correctly: ====>>>>>", () => {
      const inputs = {
        totalCollateral: 1981.66,
        positions: [
          {
            symbol: "ETH",
            position_qty: -3,
            mark_price: 1638.41,
          },
        ],
        newOrder: {
          symbol: "ETH",
          qty: -3,
          price: 1638.41,
        },
      };
      expect(estLeverage(inputs)).toBe(4.96);
    });
  });

  describe("order fee", () => {
    it("should calculate the order fee correctly", () => {
      const inputs = {
        qty: 0.1,
        price: 26000,
        futuresTakeFeeRate: 0.0006,
      };
      expect(orderFee(inputs)).toBe(1.56);
    });
  });

  describe("estLiqPrice", () => {
    it("should calculate the estimated liquidation price correctly:  Market(BTC)", () => {
      const inputs = {
        positions: [
          {
            symbol: "BTC",
            position_qty: 0.2,
            mark_price: 25986.2,
            mmr: 0.05,
          },
          {
            symbol: "ETH",
            position_qty: -3,
            mark_price: 1638.41,
            mmr: 0.05,
          },
        ],
        newOrder: {
          symbol: "BTC",
          qty: 0.1,
          price: 26000, // if market order, price is the best ask price
        },
        totalCollateral: 1981.66,
        markPrice: 25986.2,
        baseMMR: 0.05,
        baseIMR: 0.1,
        IMR_Factor: 0.0000002512,
        orderFee: 1.56,
      };
      expect(estLiqPrice(inputs)).toBe(21268.73859649123);
    });

    // test("estLiqPrice: limit order 1", () => {
    //   const data = {
    //     positions: [],
    //     newOrder: {
    //       symbol: "PERP_BTC_USDC",
    //       qty: 0.0002909,
    //       price: 68705.9,
    //     },
    //     totalCollateral: 5.4,
    //     markPrice: 68705.9,
    //     baseMMR: 0.0275,
    //     baseIMR: 0.5478,
    //     IMR_Factor: 0.0000002512,
    //     orderFee: 0.1199,
    //   };

    //   expect(estLiqPrice(data)).toBe(51560.74026092236);
    // });

    test("estLiqPrice: limit order 1", () => {
      const inputs = {
        positions: [
          {
            symbol: "BTC",
            position_qty: 0.2,
            mark_price: 25986.2,
            mmr: 0.05,
          },
          {
            symbol: "ETH",
            position_qty: -3,
            mark_price: 1638.41,
            mmr: 0.05,
          },
        ],
        newOrder: {
          symbol: "BTC",
          qty: 0.1,
          price: 25000,
        },
        totalCollateral: 1981.66,
        markPrice: 25986.2,
        baseMMR: 0.05,
        baseIMR: 0.1,
        IMR_Factor: 0.0000002512,
        orderFee: 1.5,
      };
      expect(estLiqPrice(inputs)).toBe(21250.984210526316);
    });

    test("estLiqPrice: limit order: 2", () => {
      const inputs = {
        positions: [
          {
            symbol: "BTC",
            position_qty: 0.2,
            mark_price: 25986.2,
            mmr: 0.05,
          },
          {
            symbol: "ETH",
            position_qty: -3,
            mark_price: 1638.41,
            mmr: 0.05,
          },
        ],
        newOrder: {
          symbol: "BTC",
          qty: -0.1,
          price: 25900,
        },
        totalCollateral: 1981.66,
        markPrice: 25986.2,
        baseMMR: 0.05,
        baseIMR: 0.1,
        IMR_Factor: 0.0000002512,
        orderFee: 1.554,
      };
      expect(estLiqPrice(inputs)).toBe(9102.173684210526);
    });

    test("estLiqPrice: no positions", () => {
      const inputs = {
        positions: [],
        newOrder: {
          symbol: "BTC",
          qty: 0.1,
          price: 25000,
        },
        totalCollateral: 1981.66,
        markPrice: 25986.2,
        baseMMR: 0.05,
        baseIMR: 0.1,
        IMR_Factor: 0.0000002512,
        orderFee: 1.5,
      };
      expect(estLiqPrice(inputs)).toBe(5472);
    });

    // test("estLiqPrice: ====>>>>>>", () => {
    //   const inputs = {
    //     positions: [
    //       { symbol: "ETH", position_qty: 0.01, mark_price: 3137.4, mmr: 0.05 },
    //     ],
    //     newOrder: {
    //       symbol: "ETH",
    //       qty: 1,
    //       price: 3139.2,
    //     },
    //     totalCollateral: 993.163404,
    //     markPrice: 3139.2,
    //     baseMMR: 0.025,
    //     baseIMR: 0.05,
    //     IMR_Factor: 0.0000003754,
    //     orderFee: 1.5,
    //   };
    //   expect(estLiqPrice(inputs)).toBe(5472);
    // });
  });
});
