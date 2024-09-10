import { create } from "zustand";
import { API } from "@orderly.network/types";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";

export type AppState = {
  accountInfo?: API.AccountInfo;
  positions: API.PositionExt[];
  symbolsInfo?: Record<string, API.SymbolExt>;
  fundingRates?: Record<string, API.FundingRate>;
};

export type AppActions = {
  setAccountInfo: (accountInfo: API.AccountInfo) => void;
  setPositions: (positions: API.PositionExt[]) => void;
  setSymbolsInfo: (symbolsInfo: Record<string, API.SymbolExt>) => void;
  setFundingRates: (fundingRates: Record<string, API.FundingRate>) => void;
};

export const useAppStore = create<
  AppState & {
    actions: AppActions;
  }
  //   [["zustand/devtools", never], ["zustand/immer", never]]
>()(
  devtools(
    immer((set) => ({
      // accountInfo: null,
      positions: [],

      actions: {
        setAccountInfo: (accountInfo: API.AccountInfo) => {
          set(
            (state) => {
              state.accountInfo = accountInfo;
            },
            false,
            "setAccountInfo"
          );
        },
        setPositions: (positions: API.PositionExt[]) => {
          set(
            (state) => {
              state.positions = positions;
            },
            false,
            "setPositions"
          );
        },
        setSymbolsInfo: (symbolsInfo: Record<string, API.SymbolExt>) => {
          set(
            (state) => {
              state.symbolsInfo = symbolsInfo;
            },
            false,
            "setSymbolsInfo"
          );
        },
        setFundingRates: (fundingRates: Record<string, API.FundingRate>) => {
          set(
            (state) => {
              state.fundingRates = fundingRates;
            },
            false,
            "setFundingRates"
          );
        },
      },
    })),
    {
      name: "appStore",
    }
  )
);

export const useAccountInfo = () => useAppStore((state) => state.accountInfo);
