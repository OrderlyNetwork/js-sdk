import {
  API,
  SUI_MAINNET_CHAINID,
  SuiMainnetChainInfo,
} from "@orderly.network/types";
import { ORDERLY_MAIN_CHAIN_INFO } from "../../middleware/indexedDBManager";
import { createDataStore } from "./createDataStore";

const appendSuiMainnetFallback = (data: any) => {
  const rows = Array.isArray(data?.rows) ? data.rows : [];
  const hasSuiMainnet = rows.some(
    (chain: any) =>
      Number(chain.network_infos?.chain_id ?? chain.chain_id) ===
      SUI_MAINNET_CHAINID,
  );

  if (hasSuiMainnet) {
    return rows;
  }

  return [...rows, SuiMainnetChainInfo as unknown as API.Chain];
};

export const useMainnetChainsStore = createDataStore<API.Chain>({
  name: "orderly-main-chain-info",
  dbName: "ORDERLY_STORE",
  storeName: ORDERLY_MAIN_CHAIN_INFO.name,
  keyPath: ORDERLY_MAIN_CHAIN_INFO.keyPath,
  endpoint: "/v1/public/chain_info",
  baseUrl: "https://api.orderly.org",
  initData: null,
  formatter: appendSuiMainnetFallback,
});
