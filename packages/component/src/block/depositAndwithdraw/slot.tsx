import { ExtensionPosition } from "@/plugin";
import { installExtension } from "@/plugin/install";
import { ExtensionSlot } from "@/plugin/slot";
import { Deposit } from "../deposit/deposit";

installExtension<DepositSlotProps>({
  name: "default-deposit",
  scope: ["*"],
  positions: [ExtensionPosition.DepositForm],
  __isInternal: true,
})((props) => {
  return <Deposit onOk={props.onOk} />;
});

export interface DepositSlotProps {
  onOk: () => void;
}

export const DepositSlot = (props: DepositSlotProps) => {
  return (
    <ExtensionSlot position={ExtensionPosition.DepositForm} onOk={props.onOk} />
  );
};
