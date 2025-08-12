import { ExtensionPositionEnum, installExtension } from "@orderly.network/ui";
import { DepositFormWidgetProps } from "@orderly.network/ui-transfer";

const CustomDepositForm = (props: DepositFormWidgetProps) => {
  return <div>custom deposit form</div>;
};

export function installDepositExtension() {
  installExtension<DepositFormWidgetProps>({
    name: "deposit-form",
    scope: ["*"],
    positions: [ExtensionPositionEnum.DepositForm],
    __isInternal: false,
  })((props: DepositFormWidgetProps) => {
    return <CustomDepositForm close={props.close} />;
  });
}
