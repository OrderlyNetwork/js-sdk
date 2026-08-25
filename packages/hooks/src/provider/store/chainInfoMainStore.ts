import { API } from "@orderly.network/types";
import { ORDERLY_MAIN_CHAIN_INFO } from "../../middleware/indexedDBManager";
import { mainnetChainFallback } from "./chainInfoFallback";
import { sanitizeChainInfoData } from "./chainInfoValidation";
import { createDataStore } from "./createDataStore";

const CHAIN_INFO_TIMEOUT_MS = 10_000;

export const useMainnetChainsStore = createDataStore<API.Chain>({
  name: "orderly-main-chain-info",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_MAIN_CHAIN_INFO.name,
  keyPath: ORDERLY_MAIN_CHAIN_INFO.keyPath,
  endpoint: "/v1/public/chain_info",
  baseUrl: "https://api.orderly.org",
  initData: null,
  fallbackData: mainnetChainFallback,
  timeoutMs: CHAIN_INFO_TIMEOUT_MS,
  sanitizeData: sanitizeChainInfoData,
  persistDataOrigin: true,
});
