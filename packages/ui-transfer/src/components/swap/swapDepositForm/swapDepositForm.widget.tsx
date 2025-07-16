import { FC } from "react";
import {
  useSwapDepositFormScript,
  UseSwapDepositFormScriptOptions,
} from "./swapDepositForm.script";
import { SwapDepositForm } from "./swapDepositForm.ui";

export type SwapDepositFormWidgetProps = UseSwapDepositFormScriptOptions;

export const SwapDepositFormWidget: FC<SwapDepositFormWidgetProps> = (
  props,
) => {
  const state = useSwapDepositFormScript(props);
  return <SwapDepositForm {...state} />;
};
