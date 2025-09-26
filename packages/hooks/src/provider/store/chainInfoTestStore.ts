import {
  API,
  ArbitrumSepoliaChainInfo,
  SolanaDevnetChainInfo,
} from "@orderly.network/types";
import { ORDERLY_TEST_CHAIN_INFO } from "../../middleware/indexedDBManager";
import { createDataStore } from "./createDataStore";

const testnetChainFallback = [ArbitrumSepoliaChainInfo, SolanaDevnetChainInfo];

export const useTestnetChainsStore = createDataStore<API.Chain>({
  name: "orderly-test-chain-info",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_TEST_CHAIN_INFO.name,
  keyPath: ORDERLY_TEST_CHAIN_INFO.keyPath,
  endpoint: "/v1/public/chain_info",
  baseUrl: "https://testnet-api.orderly.org",
  initData: testnetChainFallback as unknown as API.Chain[],
});
