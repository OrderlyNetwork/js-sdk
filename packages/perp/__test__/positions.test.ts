import { describe, expect, it } from "@jest/globals";
import * as positions from "../src/positions";
import type { LiqPriceInputs, MMRInputs } from "../src/positions";

describe("positions formula", () => {
  describe("liqPrice", () => {
    it("should return null when positionQty is 0", () => {
      const inputs: LiqPriceInputs = {
        markPrice: 100,
        symbol: "BTC",
        totalCollateral: 1000,
        positions: [],
        positionQty: 0,
        MMR: 0.05,
        baseMMR: 0.05,
        baseIMR: 0.1,
        IMRFactor: 0.0000002512,
        costPosition: 0,
        sumUnitaryFunding: 0,
        lastSumUnitaryFunding: 0,
      };
      expect(positions.liqPrice(inputs)).toBeNull();
    });

    it("should calculate the liqPrice correctly: BTC LONG", () => {
      const inputs: LiqPriceInputs = {
        markPrice: 90000,
        totalCollateral: 200000,
        symbol: "BTC",
        positions: [
          // BTC
          {
            position_qty: 50,
            mark_price: 90000,
            mmr: 0.01261017929,
            symbol: "BTC",
          },
          // ETH
          {
            position_qty: 100,
            mark_price: 3000,
            mmr: 0.006,
            symbol: "ETH",
          },
        ],
        positionQty: 50,
        MMR: 0.01261017929,
        baseMMR: 0.006,
        baseIMR: 0.01,
        IMRFactor: 0.0000001,
        costPosition: 0,
        sumUnitaryFunding: 0,
        lastSumUnitaryFunding: 0,
      };
      const result = positions.liqPrice(inputs);
      // Round to 5 decimal places before assertion
      const roundedResult =
        result !== null ? Math.round(result * 100000) / 100000 : null;
      expect(roundedResult).toBe(87107.62339);
    });

    it("should calculate the liqPrice correctly: BTC SHORT", () => {
      const inputs: LiqPriceInputs = {
        markPrice: 90000,
        totalCollateral: 200000,
        symbol: "BTC",
        positions: [
          // BTC
          {
            position_qty: -50,
            mark_price: 90000,
            mmr: 0.01261017929,
            symbol: "BTC",
          },
          // ETH
          {
            position_qty: 100,
            mark_price: 3000,
            mmr: 0.006,
            symbol: "ETH",
          },
        ],
        positionQty: -50,
        MMR: 0.01261017929,
        baseMMR: 0.006,
        baseIMR: 0.01,
        IMRFactor: 0.0000001,
        costPosition: 0,
        sumUnitaryFunding: 0,
        lastSumUnitaryFunding: 0,
      };
      const result = positions.liqPrice(inputs);
      // Round to 5 decimal places before assertion
      const roundedResult =
        result !== null ? Math.round(result * 100000) / 100000 : null;
      expect(roundedResult).toBe(92761.73104);
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

    it("should calculate the MMR correctly: case 1", () => {
      //ETH
      const inputs: MMRInputs = {
        baseMMR: 0.025,
        baseIMR: 0.05,
        IMRFactor: 0.0000003517,
        positionNotional: 255000,
        IMR_factor_power: 4 / 5,
      };
      expect(positions.MMR(inputs)).toBe(0.025);
    });
  });
});
