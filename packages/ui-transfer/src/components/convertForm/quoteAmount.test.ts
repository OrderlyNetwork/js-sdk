import { describe, expect, it } from "vitest";
import { calculateMinimumReceived, calculateQuoteRate } from "./quoteAmount";

describe("convert quote value calculations", () => {
  it("uses estimatedValue directly as the human-readable USDC amount", () => {
    expect(calculateQuoteRate(5, "5.005549")).toBe("1.0011098");
  });

  it("keeps the output independent of token decimals", () => {
    expect(calculateQuoteRate(5, "5.005549")).not.toBe(
      calculateQuoteRate(5, "5005549"),
    );
  });

  it("calculates minimum received from estimatedValue", () => {
    expect(calculateMinimumReceived("5.005549", "0.5")).toBe("4.980521255");
  });
});
