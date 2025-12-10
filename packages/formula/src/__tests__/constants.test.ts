import { describe, it, expect } from "@jest/globals";
import { IMRFactorPower } from "../constants";

describe("Constants", () => {
  describe("IMRFactorPower", () => {
    it("should be defined", () => {
      expect(IMRFactorPower).toBeDefined();
    });

    it("should have the correct value", () => {
      expect(IMRFactorPower).toBe(4 / 5);
      expect(IMRFactorPower).toBe(0.8);
    });

    it("should be a number", () => {
      expect(typeof IMRFactorPower).toBe("number");
    });
  });
});
