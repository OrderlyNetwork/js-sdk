import { FC } from "react";
import { TPSLForm } from "@/block/tp_sl/tpAndslForm";
import { useTaskProfitAndStopLoss } from "@orderly.network/hooks";
import { type API } from "@orderly.network/types";
import { toast } from "@/toast";

type Props = {
  symbol: string;
  quantity: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  position: API.PositionTPSLExt;
};
export const TPSLEditor: FC<Props> = (props) => {
  const { symbol, quantity } = props;
  const [order, { submit, setValue }] = useTaskProfitAndStopLoss({
    symbol,
    position_qty: quantity,
    average_open_price: props.position.average_open_price,
  });

  const onSubmit = () => {
    return submit().then(
      () => {
        props.onSuccess?.();
      },
      (error) => {
        toast.error(error.message);
      }
    );
  };

  return (
    <TPSLForm
      maxQty={quantity}
      onChange={setValue}
      symbol={symbol}
      onSubmit={onSubmit}
      onCancel={props.onCancel}
      order={order}
    />
  );
};
