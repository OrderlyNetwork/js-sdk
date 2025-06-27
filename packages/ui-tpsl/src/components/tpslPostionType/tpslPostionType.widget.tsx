import { OrderlyOrder, PositionType } from "@orderly.network/types";
import { useTPSLPositionTypeScript } from "./tpslPositionType.script";
import { TPSLPositionTypeUI } from "./tpslPositionType.ui";

type OrderValueKeys = keyof OrderlyOrder;

type PositionTypeProps = {
  value: PositionType;
  onChange: (key: OrderValueKeys, value: any) => void;
};
export const TPSLPositionTypeWidget = (props: PositionTypeProps) => {
  const state = useTPSLPositionTypeScript(props);
  return <TPSLPositionTypeUI {...state} />;
};
