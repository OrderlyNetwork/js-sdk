import { useMemo } from "react";
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

/**
 * return all tokens info
 */
export const useTokensInfo = () => {
  const tokensInfo = useTokensInfoStore((state) => state.tokensInfo);
  return tokensInfo;
};

/**
 * return token info by specify token
 */
export const useTokenInfo = (token: string) => {
  const tokensInfo = useTokensInfo();

  return useMemo(() => {
    return tokensInfo?.find((item) => item.token === token);
  }, [tokensInfo, token]);
};
