import { act, renderHook } from "@testing-library/react";
import { API, MarginMode } from "@orderly.network/types";
import { zero } from "@orderly.network/utils";
import { useAppStore } from "../../orderly/appStore";
import { createGetter } from "../../utils/createGetter";
import { useSubAccountDataObserver } from "../useSubAccountDataObserver";
import { useSubAccountMaxWithdrawal } from "../useSubAccountMaxWithdrawal";

const binary = "PERP_BTC5M2608271200_USDC";
const mockSymbols = createGetter({});
const mockFunding = {};
const mockIndexPrices = {};
let mockMarkPrices: Record<string, number> = {};
const mockAccountInfo = { imr_factor: {} };
const mockHolding = [{ token: "USDC", holding: 100 }];
const mockPositions = {
  rows: [
    {
      symbol: binary,
      position_qty: 10,
      mark_price: 0.5,
      average_open_price: 0.6,
      cost_position: 6,
      margin: 6,
      margin_mode: MarginMode.ISOLATED,
      last_sum_unitary_funding: null,
      pending_long_qty: 0,
      pending_short_qty: 0,
      mmr: 0,
      leverage: 1,
    },
    {
      symbol: "PERP_BTC5M2608271155_USDC",
      position_qty: 0,
      mark_price: 1,
      average_open_price: 0,
      cost_position: -5,
      margin: -5,
      margin_mode: MarginMode.ISOLATED,
      last_sum_unitary_funding: null,
      pending_long_qty: 0,
      pending_short_qty: 0,
      mmr: 0,
      leverage: 1,
    },
  ],
};
const mockWS = { privateSubscribe: () => () => {} };

jest.mock("../useSubAccountQuery", () => ({
  useSubAccountQuery: (url: string) => ({
    data:
      url === "/v1/client/info"
        ? mockAccountInfo
        : url === "/v1/positions"
          ? mockPositions
          : mockHolding,
  }),
}));
jest.mock("../useSubAccountWS", () => ({ useSubAccountWS: () => mockWS }));
jest.mock("../../orderly/useMarkPricesStream", () => ({
  useMarkPricesStream: () => ({ data: mockMarkPrices }),
}));
jest.mock("../../orderly/useIndexPricesStream", () => ({
  useIndexPricesStream: () => ({ data: mockIndexPrices }),
}));
jest.mock("../../orderly/useSymbolsInfo", () => ({
  useSymbolsInfo: () => mockSymbols,
}));
jest.mock("../../orderly/useFundingRates", () => ({
  useFundingRatesStore: () => mockFunding,
}));

test("subaccount valuation retains residual rows while lists and withdrawal limits stay independent", () => {
  useAppStore.setState({ tokensInfo: [] as API.Token[] });
  mockMarkPrices = { [binary]: 0.5 };
  const { result, rerender } = renderHook(() => {
    const state = useSubAccountDataObserver("test_child");
    const maximum = useSubAccountMaxWithdrawal({
      token: "USDC",
      unsettledPnL: state.portfolio?.perpUnsettledPnL,
      freeCollateral: state.portfolio?.freeCollateral ?? zero,
      holdings: state.portfolio?.holding,
    });
    return { ...state, maximum };
  });
  expect(result.current.positions.rows).toHaveLength(1);
  expect(result.current.portfolio?.totalValue?.toNumber()).toBe(105);
  expect(result.current.portfolio?.unsettledPnL).toBe(4);
  expect(result.current.maximum).toBe(100);

  for (const [mark, value, pnl] of [
    [0, 100, -1],
    [1, 110, 9],
  ]) {
    act(() => {
      mockMarkPrices = { [binary]: mark };
      rerender();
    });
    expect(result.current.positions.rows).toHaveLength(1);
    expect(result.current.portfolio?.totalValue?.toNumber()).toBe(value);
    expect(result.current.portfolio?.unsettledPnL).toBe(pnl);
    expect(result.current.portfolio?.perpUnsettledPnL).toBe(0);
    expect(result.current.maximum).toBe(100);
  }
});
