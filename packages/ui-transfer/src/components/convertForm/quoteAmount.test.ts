import { describe, expect, it } from "vitest";
import {
  calculateMinimumReceived,
  calculateQuoteRate,
  getQuoteTargetAmount,
} from "./quoteAmount";

describe("convert quote value calculations", () => {
  it("uses estimatedValue directly as the human-readable USDC amount", () => {
    expect(calculateQuoteRate(5, "5.005549")).toBe("1.0011098");
    expect(getQuoteTargetAmount("5.005549", "5005549", 6)).toBe("5.005549");
  });

  it("keeps the output independent of token decimals", () => {
    expect(calculateQuoteRate(5, "5.005549")).not.toBe(
      calculateQuoteRate(5, "5005549"),
    );
  });

  it("calculates minimum received from estimatedValue", () => {
    expect(calculateMinimumReceived("5.005549", "0.5")).toBe("4.980521255");
  });

  it("converts estimatedAmount with token decimals as the quote fallback", () => {
    expect(getQuoteTargetAmount(undefined, "100621", 6)).toBe("0.100621");
  });

  it("rejects non-positive quote fallback amounts", () => {
    expect(getQuoteTargetAmount("0", "0", 6)).toBe("-");
  });
});
