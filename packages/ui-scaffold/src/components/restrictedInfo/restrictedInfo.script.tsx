import { useRef, useState } from "react";
import { useAppContext } from "@orderly.network/react-app";
import { useConfig } from "@orderly.network/hooks";
import { useObserverElement } from "@orderly.network/ui";

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

  useObserverElement(container.current, (entry) => {
    setMutiLine(entry.contentRect.height > 28);
  });

  return {
    restrictedInfo,
    brokerName,
    container,
    mutiLine,
  };
};
