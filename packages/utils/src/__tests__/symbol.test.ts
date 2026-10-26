/// <reference types="jest" />
import { parseBinarySymbol } from "../symbol";

describe("parseBinarySymbol", () => {
  it("parses base, period, quote and the UTC round start", () => {
    expect(parseBinarySymbol("PERP_BTC5M2608271200_USDC")).toEqual({
      base: "BTC",
      period: "5M",
      quote: "USDC",
      roundStartMs: Date.UTC(2026, 7, 27, 12, 0),
      intervalSeconds: 300,
    });
    expect(parseBinarySymbol("PERP_ETH15M2612312359_USDC")).toEqual({
      base: "ETH",
      period: "15M",
      quote: "USDC",
      roundStartMs: Date.UTC(2026, 11, 31, 23, 59),
      intervalSeconds: 900,
    });
  });

  it("derives the interval from the period segment", () => {
    expect(
      parseBinarySymbol("PERP_BTC10M2608271200_USDC")?.intervalSeconds,
    ).toBe(600);
  });

  it("rejects fabricated dates instead of rolling them over", () => {
    // Feb 30 would silently become Mar 2 under Date.UTC.
    expect(parseBinarySymbol("PERP_BTC5M2602301200_USDC")).toBeUndefined();
    // Month 13 would roll into January of the next year.
    expect(parseBinarySymbol("PERP_BTC5M2613301200_USDC")).toBeUndefined();
  });

  it("rejects symbols outside the canonical pattern", () => {
    // The pattern pins the quote currency and the period whitelist.
    expect(parseBinarySymbol("PERP_BTC5M2608271200_USDT")).toBeUndefined();
    expect(parseBinarySymbol("PERP_BTC30M2608271200_USDC")).toBeUndefined();
    expect(parseBinarySymbol("PERP_BTC_USDC")).toBeUndefined();
    expect(parseBinarySymbol("BTC-USDC")).toBeUndefined();
    expect(parseBinarySymbol("")).toBeUndefined();
  });
});
