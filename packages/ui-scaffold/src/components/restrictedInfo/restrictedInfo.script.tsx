import { useRef, useState } from "react";
import { useConfig, useLocalStorage } from "@veltodefi/hooks";
import { useAppContext } from "@veltodefi/react-app";
import { useObserverElement } from "@veltodefi/ui";

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
  const [agree, setAgree] = useState(false);

  const [canUnblock, setCanUnblock] = useLocalStorage(
    "orderly_unblock_restricted",
    true,
  );

  useObserverElement(container.current, (entry) => {
    setMutiLine(entry.contentRect.height > 28);
  });

  return {
    restrictedInfo,
    brokerName,
    container,
    mutiLine,
    agree,
    setAgree,
  };
};
