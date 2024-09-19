import { useCallback, useEffect, useState } from "react";

export type UseSideMarketsScriptOptions = {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
};

export type UseSideMarketsScriptReturn = ReturnType<
  typeof useSideMarketsScript
>;

export function useSideMarketsScript(options?: UseSideMarketsScriptOptions) {
  const [collapsed, setCollapsed] = useState(options?.collapsed);

  useEffect(() => {
    setCollapsed(options?.collapsed);
  }, [options?.collapsed]);

  const onCollapse = useCallback(
    (collapsed: boolean) => {
      if (typeof options?.onCollapse === "function") {
        options.onCollapse(collapsed);
      } else {
        setCollapsed(collapsed);
      }
    },
    [options?.onCollapse]
  );

  return { collapsed, onCollapse };
}
