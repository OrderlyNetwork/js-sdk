import { API } from "@orderly.network/types";
import { ORDERLY_TEST_CHAIN_INFO } from "../../middleware/indexedDBManager";
import { testnetChainFallback } from "./chainInfoFallback";
import { sanitizeChainInfoData } from "./chainInfoValidation";
import { createDataStore } from "./createDataStore";

const CHAIN_INFO_TIMEOUT_MS = 10_000;

// Unlike the mainnet store, testnet chains intentionally use the static
// fallback as `initData`: in prod the testnet API is not guaranteed to be
// reachable, so the store must serve the fallback immediately and upgrade
// to fetched data only when the request succeeds. Consumers may therefore
// initialize with the fallback first — this divergence from mainnet
// (initData: null + fallbackData) is by design.
export const useTestnetChainsStore = createDataStore<API.Chain>({
  name: "orderly-test-chain-info",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_TEST_CHAIN_INFO.name,
  keyPath: ORDERLY_TEST_CHAIN_INFO.keyPath,
  endpoint: "/v1/public/chain_info",
  baseUrl: "https://testnet-api.orderly.org",
  initData: testnetChainFallback,
  timeoutMs: CHAIN_INFO_TIMEOUT_MS,
  sanitizeData: sanitizeChainInfoData,
  persistDataOrigin: true,
});
