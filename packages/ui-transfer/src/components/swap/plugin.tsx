import { ExtensionPositionEnum, installExtension } from "@veltodefi/ui";
import { SwapDepositFormWidget } from "./swapDepositForm";

export function installSwapDeposit() {
  installExtension<any>({
    name: "cross-deposit-form",
    scope: ["*"],
    positions: [ExtensionPositionEnum.DepositForm],
  })((props: any) => {
    return <SwapDepositFormWidget onClose={props.onClose} />;
  });
}
