import * as positions from "../src/positions";
import type { LiqPriceInputs, MMRInputs } from "../src/positions";

describe("positions formula", () => {
  describe("liqPrice", () => {
    it("should return 0 when positionQty is 0", () => {
      const inputs: LiqPriceInputs = {
        markPrice: 100,
        totalCollateral: 1000,
        positions: [],
        positionQty: 0,
        MMR: 0.5,
      };
      expect(positions.liqPrice(inputs)).toBe(0);
    });

    it("should calculate the liqPrice correctly: BTC", () => {
      const inputs: LiqPriceInputs = {
        markPrice: 25986.2,
        totalCollateral: 1981.66,
        positions: [
          // BTC
          {
            position_qty: 0.2,
            mark_price: 25986.2,
            mmr: 0.05,
          },
          //ETH
          {
            position_qty: -3,
            mark_price: 1638.41,
            mmr: 0.05,
          },
        ],
        positionQty: 0.2,
        MMR: 0.05,
      };
      expect(positions.liqPrice(inputs)).toBe(18217.586842105262);
    });
    it("should calculate the liqPrice correctly: ETH", () => {
      const inputs: LiqPriceInputs = {
        markPrice: 1638.41,
        totalCollateral: 1981.66,
        positions: [
          // BTC
          {
            position_qty: 0.2,
            mark_price: 25986.2,
            mmr: 0.05,
          },
          //ETH
          {
            position_qty: -3,
            mark_price: 1638.41,
            mmr: 0.05,
          },
        ],
        positionQty: -3,
        MMR: 0.05,
      };
      expect(positions.liqPrice(inputs)).toBe(2106.993015873016);
    });
  });

  describe("MMR", () => {
    it("should calculate the MMR correctly: BTC", () => {
      // BTC
      const inputs: MMRInputs = {
        baseMMR: 0.05,
        baseIMR: 0.1,
        IMRFactor: 0.0000002512,
        positionNotional: 5197.2,
        IMR_factor_power: 4 / 5,
      };
      expect(positions.MMR(inputs)).toBe(0.05);
    });

    it("should calculate the MMR correctly: ETH", () => {
      //ETH
      const inputs: MMRInputs = {
        baseMMR: 0.05,
        baseIMR: 0.1,
        IMRFactor: 0.0000003754,
        positionNotional: 4915.23,
        IMR_factor_power: 4 / 5,
      };
      expect(positions.MMR(inputs)).toBe(0.05);
    });
  });
});
