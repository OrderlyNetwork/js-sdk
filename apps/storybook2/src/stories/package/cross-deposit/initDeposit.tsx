import { ExtensionPositionEnum, installExtension } from "@orderly.network/ui";
import { CrossDepositFormWidget } from "@orderly.network/ui-cross-deposit";

export function initDeposit() {
  installExtension<any>({
    name: "deposit-form",
    scope: ["*"],
    positions: [ExtensionPositionEnum.DepositForm],
    __isInternal: true,
  })((props: any) => {
    return <CrossDepositFormWidget onClose={props.onClose} />;
  });
}
