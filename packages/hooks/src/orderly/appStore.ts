import { create } from "zustand";
import { API } from "@orderly.network/types";
import { immer } from "zustand/middleware/immer";
import { Decimal, zero } from "@orderly.network/utils";
// import { devtools } from "zustand/middleware";

export type AppStatus = {
  positionsLoading: boolean;
  ordersLoading: boolean;
  fundingRatesLoading: boolean;
  ready: boolean;
};

export type Portfolio = {
  holding?: API.Holding[];
  totalCollateral: Decimal;
  freeCollateral: Decimal;
  totalValue: Decimal;
  availableBalance: number;
  unsettledPnL: number;
  totalUnrealizedROI: number;
};

export type AppState = {
  accountInfo?: API.AccountInfo;
  // positions: API.PositionExt[];
  symbolsInfo?: Record<string, API.SymbolExt>;
  fundingRates?: Record<string, API.FundingRate>;
  portfolio: Portfolio;
  appState: AppStatus;
};

export type AppActions = {
  setAccountInfo: (accountInfo: API.AccountInfo) => void;
  // setPositions: (positions: API.PositionExt[]) => void;
  setSymbolsInfo: (symbolsInfo: Record<string, API.SymbolExt>) => void;
  setFundingRates: (fundingRates: Record<string, API.FundingRate>) => void;
  updateAppStatus: (key: keyof AppStatus, value: boolean) => void;
  updatePortfolio: (
    key: keyof Omit<Portfolio, "usdc" | "holding">,
    value: number | Decimal
  ) => void;

  batchUpdateForPortfolio: (data: Partial<Portfolio>) => void;
  updateHolding: (holding: API.Holding[]) => void;
};

export const useAppStore = create<
  AppState & {
    actions: AppActions;
  }
  //   [["zustand/devtools", never], ["zustand/immer", never]]
>()(
  immer((set) => ({
    // accountInfo: null,
    portfolio: {
      totalCollateral: zero,
      totalValue: zero,
      freeCollateral: zero,
      availableBalance: 0,
      unsettledPnL: 0,
      totalUnrealizedROI: 0,
    },
    appState: {
      positionsLoading: false,
      ordersLoading: false,
      fundingRatesLoading: false,
      ready: false,
    } as AppStatus,
    actions: {
      setAccountInfo: (accountInfo: API.AccountInfo) => {
        set(
          (state) => {
            state.accountInfo = accountInfo;
          },
          false
          // "setAccountInfo"
        );
      },
      setSymbolsInfo: (symbolsInfo: Record<string, API.SymbolExt>) => {
        set(
          (state) => {
            state.symbolsInfo = symbolsInfo;
          },
          false
          // "setSymbolsInfo"
        );
      },
      setFundingRates: (fundingRates: Record<string, API.FundingRate>) => {
        set(
          (state) => {
            state.fundingRates = fundingRates;
          },
          false
          // "setFundingRates"
        );
      },
      updateAppStatus: (key: keyof AppStatus, value: boolean) => {
        set(
          (state) => {
            state.appState[key] = value;
          },
          false
          // "updateAppStatus"
        );
      },
      updatePortfolio: (
        key: keyof Omit<Portfolio, "usdc" | "holding">,
        value: any
      ) => {
        set(
          (state) => {
            state.portfolio[key] = value;
          },
          false
          // "updatePortfolio"
        );
      },
      batchUpdateForPortfolio: (data: Partial<Portfolio>) => {
        set(
          (state) => {
            state.portfolio = { ...state.portfolio, ...data };
          },
          false
          // "batchUpdateForPortfolio"
        );
      },
      updateHolding: (holding: API.Holding[]) => {
        set(
          (state) => {
            state.portfolio.holding = holding;
          },
          false
          // "updateHolding"
        );
      },
    },
  }))
);

export const useAccountInfo = () => useAppStore((state) => state.accountInfo);
