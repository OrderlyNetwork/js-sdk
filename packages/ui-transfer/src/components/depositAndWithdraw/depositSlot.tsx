import { ExtensionPositionEnum, ExtensionSlot } from "@orderly.network/ui";
import { DepositFormWidget } from "../depositForm";
import { DepositFormWidgetProps } from "../depositForm/depositForm.widget";

export const DepositSlot = (props: DepositFormWidgetProps) => {
  return (
    <ExtensionSlot
      position={ExtensionPositionEnum.DepositForm}
      defaultWidget={DepositFormWidget}
      {...props}
    />
  );
};
