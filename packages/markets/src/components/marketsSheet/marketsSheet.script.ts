import { SIDE_MARKETS_TAB_SORT_STORAGE_KEY } from "../../constant";
import { useTabSort } from "../shared/hooks/useTabSort";

export type MarketsSheetScriptReturn = ReturnType<typeof useMarketsSheetScript>;

export function useMarketsSheetScript() {
  const { tabSort, onTabSort } = useTabSort({
    storageKey: SIDE_MARKETS_TAB_SORT_STORAGE_KEY,
  });
  return { tabSort, onTabSort };
}
