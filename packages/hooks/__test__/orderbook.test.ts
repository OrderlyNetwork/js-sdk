import {
  getPriceKey,
  reduceOrderbook,
} from "../src/orderly/useOrderbookStream";

describe("test orderbook utils", () => {
  test("test reduceOrderbook", () => {
    const result = reduceOrderbook(10, 0.001, true, {
      asks: [],
      bids: [],
    });
  });
  test("test getPriceKey", () => {
    it("向上取整 (asks = true)", () => {
      expect(getPriceKey(101, 10, true)).toBe(110);
      expect(getPriceKey(100, 10, true)).toBe(100);
      expect(getPriceKey(1, 5, true)).toBe(5);
    });
    it("向下取整 (asks = false)", () => {
      expect(getPriceKey(101, 10, false)).toBe(100);
      expect(getPriceKey(100, 10, false)).toBe(100);
      expect(getPriceKey(1, 5, false)).toBe(0);
    });
    it("支持 depth = 1 的情况", () => {
      expect(getPriceKey(7.6, 1, true)).toBe(8);
      expect(getPriceKey(7.6, 1, false)).toBe(7);
    });
    it("支持大数的情况", () => {
      expect(getPriceKey(123456789, 1000, true)).toBe(123457000);
      expect(getPriceKey(123456789, 1000, false)).toBe(123456000);
    });
  });
});
