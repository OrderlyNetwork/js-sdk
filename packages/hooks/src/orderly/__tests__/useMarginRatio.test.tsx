import { renderHook } from "@testing-library/react-hooks";
import { MarginRatioReturn, useMarginRatio } from "../useMarginRatio";

// OR-7485: rows that pass through PositionCalculator without symbol config
// (binary rounds that fell out of /v1/public/binary/info) carry mm undefined;
// the mm accumulators must skip them instead of feeding Decimal.add(undefined).
let mockPositionsAll: {
  rows: Array<Record<string, any>>;
  notional: number | null;
};

jest.mock("@orderly.network/perp", () => {
  const actual = jest.requireActual("@orderly.network/perp");
  return {
    ...actual,
    account: {
      ...actual.account,
      totalMarginRatio: () => 0.5,
      currentLeverage: () => 10,
      // Mirrors perp's account MMR null guards (positionsMMR/positionsNotional
      // of 0 → null) without pulling the real implementation in.
      MMR: ({
        positionsMMR,
        positionsNotional,
      }: {
        positionsMMR: number;
        positionsNotional: number;
      }) =>
        positionsMMR === 0 || positionsNotional === 0
          ? null
          : positionsMMR / positionsNotional,
    },
  };
});

// Literal instead of AccountStatusEnum.EnableTrading: jest.mock factories
// cannot reference out-of-scope imports (hoisting), and any status >= 5 takes
// the same currentLeverage branch here.
jest.mock("../../useAccount", () => ({
  useAccount: () => ({ state: { status: 999 } }),
}));

jest.mock("../useCollateral", () => ({
  useCollateral: () => ({ totalCollateral: 1000 }),
}));

jest.mock("../useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({ data: { PERP_BTC_USDC: 50000 } }),
}));

jest.mock("../usePositionStream/usePosition.store", () => ({
  usePositionStore: (selector: (state: any) => any) =>
    selector({ positions: { all: mockPositionsAll } }),
}));

describe("useMarginRatio", () => {
  test("skips rows with undefined mm instead of throwing (OR-7485)", () => {
    mockPositionsAll = {
      rows: [
        // Raw pass-through row: no mm key at all.
        {
          symbol: "PERP_BTC5M2610121040_USDC",
          position_qty: 100,
          mark_price: 0.5,
        },
        { symbol: "PERP_BTC_USDC", mm: 12.5 },
      ],
      notional: 100,
    };

    let result: MarginRatioReturn | undefined;
    expect(() => {
      result = renderHook(() => useMarginRatio()).result.current;
    }).not.toThrow();

    expect(result!.maintenanceMargin).toBe(12.5);
    expect(result!.mmr).toBe(0.125);
  });

  test("returns zero maintenance metrics when every row lacks mm", () => {
    mockPositionsAll = {
      rows: [
        {
          symbol: "PERP_BTC5M2610121040_USDC",
          position_qty: 100,
          mark_price: 0.5,
        },
      ],
      notional: 100,
    };

    const { result } = renderHook(() => useMarginRatio());

    expect(result.current.maintenanceMargin).toBe(0);
    // Mirrors perp's account MMR: positionsMMR of 0 returns null.
    expect(result.current.mmr).toBeNull();
  });
});
