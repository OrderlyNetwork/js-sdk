import { API } from "@orderly.network/types";
import { ORDERLY_MAIN_CHAIN_INFO } from "../../middleware/indexedDBManager";
import { createDataStore } from "./createDataStore";

export const useMainnetChainsStore = createDataStore<API.Chain>({
  name: "orderly-main-chain-info",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_MAIN_CHAIN_INFO.name,
  keyPath: ORDERLY_MAIN_CHAIN_INFO.keyPath,
  endpoint: "/v1/public/chain_info",
  baseUrl: "https://api.orderly.org",
  initData: null,
});
