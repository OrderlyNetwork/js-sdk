import * as positions from "../src/positions";

describe("positions formulas test", () => {
  describe("notional", () => {
    it("should return 0 when qty is 0", () => {
      expect(positions.notional(0, 1)).toBe(0);
    });
    it("should return 0 when price is 0", () => {
      expect(positions.notional(1, 0)).toBe(0);
    });

    it("should return 1 when qty is 1 and price is 1", () => {
      expect(positions.notional(1, 1)).toBe(1);
    });

    it("should return 1 when qty is -1 and price is 1", () => {
      expect(positions.notional(-1, 1)).toBe(1);
    });

    it("decimal test", () => {
      expect(positions.notional(0.1, 0.1)).toBe(0.01);
    });
  });

  describe("totalNotional", () => {
    it("should return 0 when positions is empty", () => {
      expect(positions.totalNotional([])).toBe(0);
    });

    it("total", () => {
      // 364.389,3898.665
      expect(
        positions.totalNotional([
          {
            position_qty: 0.23,
            mark_price: 1584.3,
          },
          {
            position_qty: 25991.1,
            mark_price: 0.15,
          },
        ])
      ).toBe(4263.054);
    });
  });

  describe("unrealizedPnL", () => {
    it("should return 0 when qty is 0", () => {
      expect(
        positions.unrealizedPnL({
          qty: 0,
          markPrice: 1,
          openPrice: 1,
        })
      ).toBe(0);
    });
  });
});
