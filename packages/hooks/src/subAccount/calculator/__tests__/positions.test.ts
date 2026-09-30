import { API, MarginMode } from "@orderly.network/types";
import { createGetter } from "../../../utils/createGetter";
import { formatPositions } from "../positions";

const accountInfo = {
  account_id: "test_account",
  imr_factor: {
    PERP_ETH_USDC: 0.1,
  },
  max_leverage: 10,
} as unknown as API.AccountInfo;

// Mirrors the production wiring: useSymbolsInfo() hands formatPositions a
// createGetter proxy whose get trap returns a function for ANY symbol —
// including symbols that are absent from /v1/public/info (all BINARY
// symbols are), so a truthiness check on the proxy lookup can never detect
// a missing symbol.
const symbolsInfo = createGetter({
  PERP_ETH_USDC: {
    base_imr: 0.05,
    base_mmr: 0.02,
  } as API.SymbolExt,
});

const fundingRates: Record<string, API.FundingRate> = {};

const baseRow = {
  position_qty: 10,
  mark_price: 100,
  average_open_price: 90,
  index_price: 100,
  cost_position: 900,
  last_sum_unitary_funding: 0,
  leverage: 10,
  margin_mode: MarginMode.CROSS,
};

describe("subAccount formatPositions", () => {
  it("passes rows without symbol config through unchanged (BINARY symbols)", () => {
    const binaryRow = {
      ...baseRow,
      symbol: "PERP_BTC5M2608271200_USDC",
    } as unknown as API.Position;

    const result = formatPositions(
      { rows: [binaryRow] } as API.PositionInfo,
      accountInfo,
      symbolsInfo,
      fundingRates,
    );

    // Before the getter-aware guard the perp IMR/MMR formulas ran with
    // undefined symbol config and crashed in new Decimal(undefined).
    expect(result.rows[0]).toEqual(binaryRow);
  });

  it("computes rows that have symbol config", () => {
    const perpRow = {
      ...baseRow,
      symbol: "PERP_ETH_USDC",
    } as unknown as API.Position;

    const result = formatPositions(
      { rows: [perpRow] } as API.PositionInfo,
      accountInfo,
      symbolsInfo,
      fundingRates,
    );

    const computed = result.rows[0] as unknown as API.PositionTPSLExt;
    expect(computed.notional).toBe(1000);
    expect(computed.mmr).toBeDefined();
    expect(computed.unsettlement_pnl).toBeDefined();
  });

  it("excludes pass-through rows from the aggregate totals", () => {
    const perpRow = {
      ...baseRow,
      symbol: "PERP_ETH_USDC",
    } as unknown as API.Position;
    const binaryRow = {
      ...baseRow,
      symbol: "PERP_BTC5M2608271200_USDC",
    } as unknown as API.Position;

    const result = formatPositions(
      { rows: [binaryRow, perpRow] } as API.PositionInfo,
      accountInfo,
      symbolsInfo,
      fundingRates,
    );

    // Only the configured PERP row contributes (10 × 100 = 1000).
    expect(result.notional).toBe(1000);
  });
});
