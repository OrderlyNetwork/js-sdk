import { describe, expect, it } from "vitest";
import {
  calculateMinimumReceived,
  calculateQuoteRate,
  getQuoteTokenDecimals,
  toRawQuoteAmount,
  unnormalizeAmount,
} from "./quoteAmount";

describe("convert quote amount precision", () => {
  it("uses logical token decimals instead of chain_details decimals", () => {
    expect(
      getQuoteTokenDecimals({
        decimals: 6,
        chain_details: [{ chain_id: "56", decimals: 18 }],
      }),
    ).toBe(6);
  });

  it("falls back to six decimals when logical metadata is unavailable", () => {
    expect(getQuoteTokenDecimals()).toBe(6);
    expect(getQuoteTokenDecimals({})).toBe(6);
  });

  it("matches a human amount to the quote raw amount", () => {
    expect(toRawQuoteAmount(5, getQuoteTokenDecimals({ decimals: 6 }))).toBe(
      "5000000",
    );
  });

  it("normalizes the response output using logical decimals", () => {
    expect(unnormalizeAmount("5005549", 6)).toBe("5.005549");
    expect(unnormalizeAmount("5005549", 18)).not.toBe("5.005549");
  });

  it("keeps rate and minimum received calculations exact", () => {
    expect(calculateQuoteRate("5000000", "5005549", 6, 6)).toBe("1.0011098");
    expect(calculateMinimumReceived("5005549", "0.5")).toBe("4980521.255");
  });
});
