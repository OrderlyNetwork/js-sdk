import { API } from "@orderly.network/types";
import { ORDERLY_MAIN_TOKEN } from "../../middleware/indexedDBManager";
import { createDataStore } from "./createDataStore";

export const useMainTokenStore = createDataStore<API.Token>({
  name: "orderly-main-token",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_MAIN_TOKEN.name,
  keyPath: ORDERLY_MAIN_TOKEN.keyPath,
  endpoint: "/v1/public/token",
  baseUrl: "https://api.orderly.org",
});
