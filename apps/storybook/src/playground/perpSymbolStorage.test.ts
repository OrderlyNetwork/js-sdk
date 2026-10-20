import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PERP_SYMBOL_STORAGE_KEY,
  getStoredPerpSymbol,
  setStoredPerpSymbol,
} from "@orderly.network/trading-shared";
import {
  DEFAULT_SYMBOL,
  getPerpSymbol,
  setPerpSymbol,
} from "./perpSymbolStorage";

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

describe("playground symbol storage", () => {
  it("round-trips a regular perps symbol", () => {
    setPerpSymbol("PERP_BTC_USDC");
    expect(getPerpSymbol()).toBe("PERP_BTC_USDC");
  });

  it("falls back to the default symbol when nothing is stored", () => {
    expect(getPerpSymbol()).toBe(DEFAULT_SYMBOL);
  });

  it("treats an empty value as nothing stored", () => {
    setPerpSymbol("");
    expect(getPerpSymbol()).toBe(DEFAULT_SYMBOL);
  });

  it("refuses to persist a prediction round symbol", () => {
    setPerpSymbol("PERP_BTC_USDC");
    setPerpSymbol("PERP_BTC5M2608271200_USDC");
    expect(localStorage.getItem(PERP_SYMBOL_STORAGE_KEY)).toBe("PERP_BTC_USDC");
  });

  it("never stores a prediction round symbol, even from an empty store", () => {
    setPerpSymbol("PERP_BTC5M2608271200_USDC");
    expect(localStorage.getItem(PERP_SYMBOL_STORAGE_KEY)).toBeNull();
  });

  it("sanitizes a prediction round symbol stored before the guard existed", () => {
    localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, "PERP_BTC5M2608271200_USDC");
    expect(getPerpSymbol()).toBe(DEFAULT_SYMBOL);
  });
});

describe("SDK perpSymbolStorage helpers", () => {
  it("returns null instead of a default when nothing valid is stored", () => {
    expect(getStoredPerpSymbol()).toBeNull();
  });

  it("round-trips a perps symbol directly", () => {
    setStoredPerpSymbol("PERP_BTC_USDC");
    expect(getStoredPerpSymbol()).toBe("PERP_BTC_USDC");
  });

  it("removes a stored prediction round symbol on read (self-heal)", () => {
    localStorage.setItem(PERP_SYMBOL_STORAGE_KEY, "PERP_BTC5M2608271200_USDC");
    expect(getStoredPerpSymbol()).toBeNull();
    expect(localStorage.getItem(PERP_SYMBOL_STORAGE_KEY)).toBeNull();
  });
});
