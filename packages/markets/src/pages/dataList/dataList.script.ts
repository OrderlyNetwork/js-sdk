import { useState } from "react";

export type TabName = "favorites" | "all" | "new";

export type UseMarketsDataListScript = ReturnType<
  typeof useMarketsDataListScript
>;

export const useMarketsDataListScript = () => {
  const [active, setActive] = useState<TabName>("favorites");

  return {
    active,
    onTabChange: (value: string) => setActive(value as TabName),
  };
};
