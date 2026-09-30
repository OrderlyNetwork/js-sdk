import { type API } from "@orderly.network/types";
import { toBinarySymbolsInfo } from "../binaryInfo";

// Match the positions.test.ts pattern: mock the stores so the module graph
// doesn't pull the real account/chain dependencies into jsdom.
jest.mock("../appStore", () => ({
  useAppStore: {
    getState: jest.fn(() => ({
      actions: { setBinarySymbolsInfo: jest.fn() },
    })),
  },
}));

jest.mock("../../useQuery", () => ({
  useQuery: jest.fn(),
}));

const BINARY_ROW = {
  symbol: "PERP_BTC5M2609290800_USDC",
  status: "ACTIVE",
  product_type: "BINARY",
  activated_at: 1790664260085,
  observation_start_at: 1790668800000,
  expire_at: 1790669100000,
  s0: null,
  index_price_symbol: "PERP_BTC_USDC",
  fee_model: "BINARY_PROBABILITY",
  quote_min: 0.01,
  quote_max: 0.99,
  quote_tick: 0.01,
  base_min: 0.01,
  base_max: 10000,
  base_tick: 0.01,
  min_notional: 5,
  imr_factor: 0.000000091,
} as API.BinaryInfoRow;

describe("toBinarySymbolsInfo", () => {
  test("maps rows keyed by symbol with the PRD-fixed margin params", () => {
    const info = toBinarySymbolsInfo([BINARY_ROW]);
    const entry = info["PERP_BTC5M2609290800_USDC"];

    expect(entry).toBeDefined();
    // PRD: every binary symbol is configured with imr=1 / mmr=0 — that is
    // what keeps binary out of normal isolated liquidation.
    expect(entry!.base_imr).toBe(1);
    expect(entry!.base_mmr).toBe(0);
    expect(entry!.imr_factor).toBe(0.000000091);
  });

  test("derives display fields from the symbol and ticks", () => {
    const entry = toBinarySymbolsInfo([BINARY_ROW])[
      "PERP_BTC5M2609290800_USDC"
    ];

    expect(entry!.base).toBe("BTC5M2609290800");
    expect(entry!.quote).toBe("USDC");
    expect(entry!.type).toBe("PERP");
    expect(entry!.name).toBe("BTC5M2609290800-PERP");
    expect(entry!.base_dp).toBe(2);
    expect(entry!.quote_dp).toBe(2);
  });

  test("returns an empty record for missing or empty input", () => {
    expect(toBinarySymbolsInfo(undefined)).toEqual({});
    expect(toBinarySymbolsInfo(null)).toEqual({});
    expect(toBinarySymbolsInfo([])).toEqual({});
  });

  test("skips rows without a symbol", () => {
    const info = toBinarySymbolsInfo([
      BINARY_ROW,
      { ...BINARY_ROW, symbol: "" },
    ]);

    expect(Object.keys(info)).toEqual(["PERP_BTC5M2609290800_USDC"]);
  });
});
