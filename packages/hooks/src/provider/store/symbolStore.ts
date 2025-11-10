import { API } from "@orderly.network/types";
import { ORDERLY_SYMBOLS } from "../../middleware/indexedDBManager";
import { createDataStore } from "./createDataStore";

export const useSymbolStore = createDataStore<API.Symbol>({
  name: "orderly-main-symbols",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_SYMBOLS.name,
  keyPath: ORDERLY_SYMBOLS.keyPath,
  endpoint: "/v1/public/info",
});
