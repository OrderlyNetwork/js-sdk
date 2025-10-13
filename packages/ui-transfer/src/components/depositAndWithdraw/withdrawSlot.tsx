import { ExtensionPositionEnum, ExtensionSlot } from "@kodiak-finance/orderly-ui";
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
