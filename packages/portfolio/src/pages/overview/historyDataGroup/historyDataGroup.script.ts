import { useState } from "react";

export type TabName = "deposit" | "funding" | "distribution";

export const useHistoryDataGroupScript = () => {
  const [active, setActive] = useState<TabName>("deposit");
  return {
    active,
    onTabChange: setActive as React.Dispatch<React.SetStateAction<string>>,
  } as const;
};
