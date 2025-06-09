import { useState } from "react";

export type TabName = "deposit" | "funding" | "distribution";

export const useStateScript = () => {
  const [active, setActive] = useState<TabName>("deposit");
  return {
    active,
    onTabChange: setActive as React.Dispatch<React.SetStateAction<string>>,
  } as const;
};

export type UseStateScript = ReturnType<typeof useStateScript>;
