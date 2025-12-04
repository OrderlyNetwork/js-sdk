import {
  API,
  ArbitrumSepoliaTokenInfo,
  SolanaDevnetTokenInfo,
  TesnetTokenFallback,
} from "@veltodefi/types";
import { ORDERLY_TEST_TOKEN } from "../../middleware/indexedDBManager";
import { createDataStore } from "./createDataStore";

const testnetTokenFallback = TesnetTokenFallback([
  ArbitrumSepoliaTokenInfo,
  SolanaDevnetTokenInfo,
]);

export const useTestTokenStore = createDataStore<API.Token>({
  name: "orderly-main-token",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_TEST_TOKEN.name,
  keyPath: ORDERLY_TEST_TOKEN.keyPath,
  endpoint: "/v1/public/token",
  initData: testnetTokenFallback as API.Token[],
});
