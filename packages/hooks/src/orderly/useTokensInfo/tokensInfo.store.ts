import { useMemo } from "react";
import { useAppStore } from "../appStore";

// interface TokensInfoStore {
//   tokensInfo: API.Chain[];
// }

// interface TokensInfoActions {
//   setTokensInfo: (data: API.Chain[]) => void;
// }

// export const useTokensInfoStore = create<TokensInfoStore & TokensInfoActions>(
//   (set) => ({
//     tokensInfo: [],
//     setTokensInfo(data) {
//       set({ tokensInfo: data });
//     },
//   }),
// );

/**
 * return all tokens info
 */
export const useTokensInfo = () => {
  const tokensInfo = useAppStore((state) => state.tokensInfo);
  return tokensInfo;
  // const mainTokens = useMainTokenStore((state) => state.data);
  // const testTokens = useTestTokenStore((state) => state.data);
  // const env = useConfig("env");
  // return env === "prod" ? mainTokens : testTokens;
  // const tokensInfo = useTokensInfoStore((state) => state.tokensInfo);
  // return tokensInfo;
};

/**
 * return token info by specify token
 */
export const useTokenInfo = (token: string) => {
  const tokensInfo = useAppStore((state) => state.tokensInfo);

  return useMemo(() => {
    return tokensInfo?.find((item) => item.token === token);
  }, [tokensInfo, token]);
};
