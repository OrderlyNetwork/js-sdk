import { Divider } from "@/divider";
import { SwapSymbols, SymbolInfo } from "./sections/symbols";

import { SwapTime } from "./sections/swapTime";
import { FC, useCallback, useMemo, useState } from "react";
import { SwapDetails } from "./sections/swapDetials";
import { SwapProcess } from "./sections/swapProcess";

export interface SwapProps {
  src: SymbolInfo;
  dst: SymbolInfo;
}

export const Swap: FC<SwapProps> = (props) => {
  const [view, setView] = useState<"processing" | "details">("details");

  const doSwap = useCallback(() => {
    setView("processing");
  }, []);

  const content = useMemo(() => {
    if (view === "details") {
      return <SwapDetails onConfirm={doSwap} />;
    }

    return <SwapProcess />;
  }, [view]);

  return (
    <div>
      <div className="py-[24px]">
        <SwapSymbols from={props.src} to={props.dst} />
        <SwapTime />
      </div>
      <Divider />

      {content}
    </div>
  );
};
