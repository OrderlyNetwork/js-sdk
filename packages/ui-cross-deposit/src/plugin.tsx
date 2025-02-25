import { ExtensionPositionEnum, installExtension } from "@orderly.network/ui";
import { CrossDepositFormWidget } from "./components/crossDepositForm";

export function installCrossDeposit() {
  installExtension<any>({
    name: "cross-deposit-form",
    scope: ["*"],
    positions: [ExtensionPositionEnum.DepositForm],
    __isInternal: true,
  })((props: any) => {
    return <CrossDepositFormWidget onClose={props.onClose} />;
  });
}
