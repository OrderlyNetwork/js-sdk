import { useAppContext } from "@orderly.network/react-app";
import { useConfig, useRestrictedAreas } from "@orderly.network/hooks";
import { useEffect, useRef, useState } from "react";

export type UseRestrictedAreasScriptReturn = ReturnType<
  typeof useRestrictedAreasScript
> & {
  brokerName?: string;
};

export const useRestrictedAreasScript = () => {
  const { restrictedInfo, setDisabledConnect } = useAppContext();
  const restrictedAreas = useRestrictedAreas(restrictedInfo);
  const brokerName = useConfig("brokerName");
  const container = useRef<HTMLDivElement>(null);
  const [mutiLine, setMutiLine] = useState(false);

  useEffect(() => {
    setDisabledConnect(restrictedAreas.restrictedAreasOpen);
  }, [restrictedAreas.restrictedAreasOpen]);

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
    ...restrictedAreas,
    brokerName,
    container,
    mutiLine,
  };
};
