import { create } from "zustand";
import type { API } from "@orderly.network/types";

interface TokensInfoStore {
  tokensInfo: API.Chain[];
}

interface TokensInfoActions {
  setTokensInfo: (data: API.Chain[]) => void;
}

export const useTokensInfoStore = create<TokensInfoStore & TokensInfoActions>(
  (set) => ({
    tokensInfo: [],
    setTokensInfo(data) {
      set({ tokensInfo: data });
    },
  }),
);

export const useTokensInfo = () => {
  const tokensInfo = useTokensInfoStore((state) => state.tokensInfo);
  return tokensInfo;
};
