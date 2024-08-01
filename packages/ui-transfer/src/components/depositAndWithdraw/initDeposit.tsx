import {
  ExtensionPositionEnum,
  ExtensionSlot,
  installExtension,
} from "@orderly.network/ui";
import { DepositFormWidget } from "../depositForm";
import { DepositFormWidgetProps } from "../depositForm/widget";

export function initDeposit() {
  installExtension<DepositFormWidgetProps>({
    name: "deposit-form",
    scope: ["*"],
    positions: [ExtensionPositionEnum.DepositForm],
    __isInternal: true,
  })((props: DepositFormWidgetProps) => {
    return <DepositFormWidget onClose={props.onClose} />;
  });
}

export const DepositSlot = (props: DepositFormWidgetProps) => {
  return (
    <ExtensionSlot
      position={ExtensionPositionEnum.DepositForm}
      defaultWidget={<DepositFormWidget onClose={props.onClose} />}
      {...props}
    />
  );
};
