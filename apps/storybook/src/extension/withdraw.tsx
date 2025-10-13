import {
  ExtensionPositionEnum,
  installExtension,
} from "@kodiak-finance/orderly-ui";
import { WithdrawFormWidgetProps } from "@kodiak-finance/orderly-ui-transfer";

const CustomWithdrawForm = (props: WithdrawFormWidgetProps) => {
  return <div>custom withdraw form</div>;
};

export function installWithdrawExtension() {
  installExtension<WithdrawFormWidgetProps>({
    name: "withdraw-form",
    scope: ["*"],
    positions: [ExtensionPositionEnum.WithdrawForm],
    __isInternal: false,
  })((props: WithdrawFormWidgetProps) => {
    return <CustomWithdrawForm close={props.close} />;
  });
}
