import { ExtensionPositionEnum, installExtension } from "@veltodefi/ui";
import { WithdrawFormWidgetProps } from "@veltodefi/ui-transfer";

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
