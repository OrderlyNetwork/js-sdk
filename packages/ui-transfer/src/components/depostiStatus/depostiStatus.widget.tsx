import { useDepositStatusScript } from "./depostiStatus.script";
import { DepositStatus, DepositStatusProps } from "./depostiStatus.ui";

export type DepositStatusWidgetProps = Pick<
  DepositStatusProps,
  "className" | "onClick"
>;

export const DepositStatusWidget = (props: DepositStatusWidgetProps) => {
  const state = useDepositStatusScript();
  return <DepositStatus {...state} {...props} />;
};
