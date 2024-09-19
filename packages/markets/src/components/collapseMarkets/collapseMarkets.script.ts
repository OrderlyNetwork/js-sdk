import { useEffect, useState } from "react";
import { MarketsType, useMarketList } from "@orderly.network/hooks";

export type TabName = "favorites" | "recent" | "all";

export type UseCollapseMarketsScriptReturn = ReturnType<
  typeof useCollapseMarketsScript
>;

export function useCollapseMarketsScript() {
  const [data, favorite] = useMarketList(MarketsType.ALL);

  return {
    dataSource: data,
  };
}
