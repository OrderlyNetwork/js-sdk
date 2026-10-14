import { act, renderHook } from "@testing-library/react";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { useAppStore } from "../appStore";
import { useCollateral } from "../useCollateral";
import { useComputedLTV } from "../useComputedLTV";
import { useMaxWithdrawal } from "../useMaxWithdrawal";
import { useTransfer } from "../useTransfer";
import { useWithdraw } from "../useWithdraw";

let mockUSDCHolding = 100;
const mockHoldings = () => [
  { token: "USDC", holding: mockUSDCHolding },
  { token: "USDT", holding: 100 },
];

jest.mock("../..", () => ({
  useIndexPricesStream: () => ({ getIndexPrice: () => 1 }),
  useUpdatedRef: (value: number) => ({ current: value }),
  useTokenInfo: () => ({ decimals: 6 }),
  useHoldingStream: () => ({
    usdc: mockHoldings()[0],
    data: mockHoldings(),
  }),
}));
jest.mock("../useHoldingStream", () => ({
  useHoldingStream: () => ({
    usdc: mockHoldings()[0],
    data: mockHoldings(),
  }),
}));
jest.mock("../../useAccount", () => ({
  useAccount: () => ({ account: { assetsManager: {} }, state: {} }),
}));
jest.mock("../../useConfig", () => ({ useConfig: () => "testnet" }));
jest.mock("../../useTrack", () => ({ useTrack: () => ({ track: jest.fn() }) }));
jest.mock("../useChains", () => ({
  useChains: () => [
    [],
    {
      findByChainId: () => ({
        token_infos: [{ symbol: "USDC", decimals: 6 }],
        network_infos: { chain_id: 421614 },
      }),
      isTestnetChain: () => true,
    },
  ],
}));
jest.mock("../../subAccount/useSubAccountMutation", () => ({
  useSubAccountMutation: () => [jest.fn(), { isMutating: false }],
}));

describe("ordinary Perp funding consumers", () => {
  beforeEach(() => {
    mockUSDCHolding = 100;
    useAppStore.getState().actions.cleanAll();
    useAppStore.setState({
      tokensInfo: [
        {
          token: "USDT",
          base_weight: 1,
          discount_factor: 0,
          user_max_qty: -1,
        },
      ] as API.Token[],
    });
    useAppStore.getState().actions.batchUpdateForPortfolio({
      freeCollateral: new Decimal(100),
      availableBalance: 120,
      unsettledPnL: 1_020,
      perpUnsettledPnL: 20,
    });
  });

  afterEach(() => {
    act(() => useAppStore.getState().actions.cleanAll());
  });

  test("withdrawal limits and transfer hints ignore changes to Binary equity PnL", () => {
    const { result } = renderHook(() => ({
      collateral: useCollateral(),
      maximum: useMaxWithdrawal("USDC"),
      withdrawal: useWithdraw({ token: "USDC", srcChainId: 421614 }),
      transfer: useTransfer({ token: "USDC" }),
    }));

    for (const totalPnL of [1_020, -980, 20]) {
      act(() => {
        useAppStore.getState().actions.batchUpdateForPortfolio({
          unsettledPnL: totalPnL,
        });
      });
      expect(result.current.collateral.unsettledPnL).toBe(totalPnL);
      expect(result.current.maximum).toBe(80);
      expect(result.current.withdrawal.maxAmount).toBe(80);
      expect(result.current.withdrawal.availableWithdraw).toBe(80);
      expect(result.current.withdrawal.unsettledPnL).toBe(20);
      expect(result.current.transfer.maxAmount).toBe(80);
      expect(result.current.transfer.unsettledPnL).toBe(20);
    }

    act(() => {
      useAppStore.getState().actions.batchUpdateForPortfolio({
        perpUnsettledPnL: -20,
      });
    });
    expect(result.current.maximum).toBe(100);
    expect(result.current.withdrawal.availableWithdraw).toBe(100);
    expect(result.current.transfer.unsettledPnL).toBe(-20);
  });

  test("LTV uses ordinary Perp losses even when total equity PnL is positive", () => {
    mockUSDCHolding = -10;
    useAppStore.getState().actions.batchUpdateForPortfolio({
      perpUnsettledPnL: -20,
    });
    const { result } = renderHook(() => useComputedLTV());
    expect(result.current).toBe(30);

    act(() => {
      useAppStore.getState().actions.batchUpdateForPortfolio({
        unsettledPnL: -1_020,
      });
    });
    expect(result.current).toBe(30);
  });
});
