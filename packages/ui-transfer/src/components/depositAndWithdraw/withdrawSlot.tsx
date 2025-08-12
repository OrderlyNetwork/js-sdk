import { ExtensionPositionEnum, ExtensionSlot } from "@orderly.network/ui";
import { WithdrawFormWidget } from "../withdrawForm";
import { WithdrawFormWidgetProps } from "../withdrawForm/withdrawForm.widget";

export const WithdrawSlot = (props: WithdrawFormWidgetProps) => {
  return (
    <ExtensionSlot
      position={ExtensionPositionEnum.WithdrawForm}
      defaultWidget={WithdrawFormWidget}
      {...props}
    />
  );
};
