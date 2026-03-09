// --- Fiat currencies ---

export const FIAT_CURRENCIES = [
  "USD",
  "EUR",
  "CNY",
  "HKD",
  "TWD",
  "KRW",
  "JPY",
] as const;

export type FiatCurrency = (typeof FIAT_CURRENCIES)[number];

// --- Preset spend amounts per fiat currency ---

export const PRESET_AMOUNTS: Record<FiatCurrency, readonly number[]> = {
  USD: [100, 500, 1000, 5000],
  EUR: [100, 500, 1000, 5000],
  CNY: [1000, 5000, 10000, 50000],
  HKD: [1000, 5000, 10000, 50000],
  TWD: [5000, 20000, 50000, 200000],
  KRW: [200000, 500000, 1000000, 5000000],
  JPY: [20000, 50000, 100000, 500000],
};

// --- Onramper widget base URL ---

export const ONRAMPER_WIDGET_BASE = "https://buy.onramper.com";

// --- Formatting helpers ---

export function formatCompact(n: number): string {
  const suffixes: [number, string][] = [
    [1_000_000_000, "B"],
    [1_000_000, "M"],
    [1_000, "K"],
  ];
  for (const [threshold, suffix] of suffixes) {
    if (n >= threshold) {
      const val = n / threshold;
      return (val % 1 === 0 ? val.toString() : val.toFixed(1)) + suffix;
    }
  }
  return n.toLocaleString();
}
