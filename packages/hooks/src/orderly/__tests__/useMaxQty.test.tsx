import { renderHook } from "@testing-library/react-hooks";
import { MarginMode, OrderSide } from "@orderly.network/types";
import { useMaxQty } from "../useMaxQty";

const mockMaxQtyForIsolatedMargin = jest.fn((..._args: unknown[]) => 42);

jest.mock("@orderly.network/perp", () => {
  const actual = jest.requireActual("@orderly.network/perp");
  return {
    ...actual,
    account: {
      ...actual.account,
      maxQtyForIsolatedMargin: (...args: unknown[]) =>
        mockMaxQtyForIsolatedMargin(...args),
    },
  };
});

jest.mock("../appStore", () => ({
  useAccountInfo: () => ({
    imr_factor: { PERP_BTC_USDC: 0.0000001 },
    max_notional: { PERP_BTC_USDC: 1000000 },
  }),
}));

jest.mock("../useCollateral", () => ({
  useCollateral: () => ({
    totalCollateral: 1000,
    freeCollateral: 250,
    freeCollateralUSDCOnly: 10,
  }),
}));

jest.mock("../useLeverageBySymbol", () => ({
  useLeverageBySymbol: () => 10,
}));

jest.mock("../useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({
    data: { PERP_BTC_USDC: 50000 },
  }),
}));

jest.mock("../usePositionStream/usePosition.store", () => ({
  usePositions: () => [],
}));

jest.mock("../useSymbolsInfo", () => ({
  useSymbolsInfo: () => ({
    PERP_BTC_USDC: (key: string) =>
      ({
        base_imr: 0.1,
        base_max: 100,
      })[key],
  }),
}));

describe("useMaxQty", () => {
  beforeEach(() => {
    mockMaxQtyForIsolatedMargin.mockClear();
  });

  it("should use total free collateral for isolated-margin orders", () => {
    const { result } = renderHook(() =>
      useMaxQty("PERP_BTC_USDC", OrderSide.BUY, {
        marginMode: MarginMode.ISOLATED,
      }),
    );

    expect(result.current).toBe(42);
    expect(mockMaxQtyForIsolatedMargin).toHaveBeenCalledWith(
      expect.objectContaining({
        availableBalance: 250,
      }),
    );
  });
});
