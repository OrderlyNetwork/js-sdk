import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SYMBOL,
  ORDERLY_SYMBOL_KEY,
  getSymbol,
  updateSymbol,
} from "./storage";

describe("playground symbol storage", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
      removeItem: (key: string) => void store.delete(key),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips a regular perps symbol", () => {
    updateSymbol("PERP_BTC_USDC");
    expect(getSymbol()).toBe("PERP_BTC_USDC");
  });

  it("falls back to the default symbol when nothing is stored", () => {
    expect(getSymbol()).toBe(DEFAULT_SYMBOL);
  });

  it("stores the default symbol for an empty value", () => {
    updateSymbol("");
    expect(getSymbol()).toBe(DEFAULT_SYMBOL);
  });

  it("refuses to persist a prediction round symbol", () => {
    updateSymbol("PERP_BTC_USDC");
    updateSymbol("PERP_BTC5M2608271200_USDC");
    expect(localStorage.getItem(ORDERLY_SYMBOL_KEY)).toBe("PERP_BTC_USDC");
  });

  it("never stores a prediction round symbol, even from an empty store", () => {
    updateSymbol("PERP_BTC5M2608271200_USDC");
    expect(localStorage.getItem(ORDERLY_SYMBOL_KEY)).toBeNull();
  });

  it("sanitizes a prediction round symbol stored before the guard existed", () => {
    localStorage.setItem(ORDERLY_SYMBOL_KEY, "PERP_BTC5M2608271200_USDC");
    expect(getSymbol()).toBe(DEFAULT_SYMBOL);
  });
});
