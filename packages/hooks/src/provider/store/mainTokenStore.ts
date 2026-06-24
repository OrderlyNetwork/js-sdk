import {
  API,
  SUI_MAINNET_CHAINID,
  SuiMainnetTokenInfo,
} from "@orderly.network/types";
import { ORDERLY_MAIN_TOKEN } from "../../middleware/indexedDBManager";
import { createDataStore } from "./createDataStore";

const appendSuiMainnetTokenFallback = (data: any) => {
  const rows = Array.isArray(data?.rows) ? data.rows : [];

  return rows.map((token: API.Token) => {
    if (token.token !== "USDC") {
      return token;
    }

    const chainDetails = token.chain_details ?? [];
    const hasSuiMainnet = chainDetails.some(
      (chainDetail) => Number(chainDetail.chain_id) === SUI_MAINNET_CHAINID,
    );

    if (hasSuiMainnet) {
      return token;
    }

    return {
      ...token,
      chain_details: [...chainDetails, SuiMainnetTokenInfo],
    };
  });
};

export const useMainTokenStore = createDataStore<API.Token>({
  name: "orderly-main-token",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_MAIN_TOKEN.name,
  keyPath: ORDERLY_MAIN_TOKEN.keyPath,
  endpoint: "/v1/public/token",
  baseUrl: "https://api.orderly.org",
  formatter: appendSuiMainnetTokenFallback,
});
