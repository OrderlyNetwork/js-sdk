// import { produce } from "immer";
import { create } from "zustand";
import type { API } from "@orderly.network/types";

interface TokenInfoStore {
  tokenInfo: API.Chain[];
}

interface TokenInfoActions {
  setTokenInfo: (data: API.Chain[]) => void;
}

export const useTokenInfoStore = create<TokenInfoStore & TokenInfoActions>(
  (set) => ({
    tokenInfo: [],
    setTokenInfo(data) {
      set({ tokenInfo: data });
    },
  }),
);
