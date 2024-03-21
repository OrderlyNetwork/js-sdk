import { useTPSLOrderRowContext } from "@/block/tp_sl/tpslOrderRowContext";
import { TPSLTriggerPrice } from "@/block/positions/full/tpslTriggerPrice";

export const OrderTriggerPrice = () => {
  const { sl_trigger_price, tp_trigger_price } = useTPSLOrderRowContext();

  return (
    <TPSLTriggerPrice
      stopLossPrice={sl_trigger_price}
      takeProfitPrice={tp_trigger_price}
      direction={"column"}
      tooltip
    />
  );
};
