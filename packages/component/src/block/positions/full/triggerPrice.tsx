import { FC } from "react";
import { usePositionsRowContext } from "./positionRowContext";
import { TPSLTriggerPrice } from "./tpslTriggerPrice";

export const TriggerPrice: FC<{
  stopLossPrice?: number;
  takeProfitPrice?: number;
}> = (props) => {
  const { stopLossPrice, takeProfitPrice } = props;
  const { tpslOrder, position } = usePositionsRowContext();

  return (
    <TPSLTriggerPrice
      stopLossPrice={stopLossPrice}
      takeProfitPrice={takeProfitPrice}
      direction={"column"}
      order={tpslOrder}
      position={position}
      tooltip
    />
  );
};
