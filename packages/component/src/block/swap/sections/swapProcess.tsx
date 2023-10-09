import { useState } from "react";
import { SwapProcessStatus, SwapProcessStatusState } from "./swapProcessStatus";

export const SwapProcess = () => {
  const [state, setState] = useState<SwapProcessStatusState>(
    SwapProcessStatusState.Bridging
  );
  return <SwapProcessStatus state={state} />;
};
