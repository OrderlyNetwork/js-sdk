import { estLeverage, estLiqPrice } from "../src/order";

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
          price: 25986.2,
        },
        totalCollateral: 1981.66,
        markPrice: 25986.2,
        baseMMR: 0.05,
        baseIMR: 0.1,
        IMR_Factor: 0.0000002512,
      };
      expect(estLiqPrice(inputs)).toBe(21263.022807017544);
    });
  });
});
