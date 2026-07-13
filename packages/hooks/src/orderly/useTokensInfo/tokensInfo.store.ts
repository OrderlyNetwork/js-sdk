import { useMemo } from "react";
import { NetworkId } from "@orderly.network/types";
import { useMainTokenStore } from "../../provider/store/mainTokenStore";
import { useTestTokenStore } from "../../provider/store/testTokenStore";
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
export const useTokenInfo = (token: string, networkId?: NetworkId) => {
  const appTokensInfo = useAppStore((state) => state.tokensInfo);
  const mainTokensInfo = useMainTokenStore((state) => state.data);
  const testTokensInfo = useTestTokenStore((state) => state.data);

  const tokensInfo = useMemo(() => {
    if (networkId === "mainnet") {
      return mainTokensInfo;
    }

    if (networkId === "testnet") {
      return testTokensInfo;
    }

    return appTokensInfo;
  }, [appTokensInfo, mainTokensInfo, networkId, testTokensInfo]);

  return useMemo(() => {
    return tokensInfo?.find((item) => item.token === token);
  }, [tokensInfo, token]);
};
