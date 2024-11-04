import { useTabSort } from "../shared/hooks/useTabSort";

export type UseMarketsSheetScriptOptions = {};

export type UseMarketsSheetScriptReturn = ReturnType<
  typeof useMarketsSheetScript
>;

export function useMarketsSheetScript(options?: UseMarketsSheetScriptOptions) {
  const { tabSort, onTabSort } = useTabSort({
    storageKey: "orderly_side_markets_tab_sort",
  });
  return { tabSort, onTabSort };
}
