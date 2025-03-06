import { useAppContext } from "@orderly.network/react-app";
import { useConfig } from "@orderly.network/hooks";
import { useEffect, useRef, useState } from "react";

export type UseRestrictedInfoScriptReturn = ReturnType<
  typeof useRestrictedInfoScript
> & {
  brokerName?: string;
};

export const useRestrictedInfoScript = () => {
  const { restrictedInfo } = useAppContext();
  const brokerName = useConfig("brokerName");
  const container = useRef<HTMLDivElement>(null);
  const [mutiLine, setMutiLine] = useState(false);

  useEffect(() => {
    const element = container.current;

    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        setMutiLine(height > 28);
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
    };
  }, []);

  return {
    restrictedInfo,
    brokerName,
    container,
    mutiLine,
  };
};
