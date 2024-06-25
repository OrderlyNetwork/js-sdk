import { useState } from "react";

export type TabName = "deposit" | "funding" | "distribution";

export const useStateScript = () => {
  const [active, setActive] = useState<TabName>("deposit");

  return {
    active,
    onTabChange: (value: string) => setActive(value as TabName),
  };
};

export type UseStateScript = ReturnType<typeof useStateScript>;
