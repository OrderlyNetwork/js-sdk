import { FC } from "react";
import { TPSLForm } from "@/block/tp_sl/tpAndslForm";
import { useTaskProfitAndStopLoss } from "@orderly.network/hooks";
import { type API } from "@orderly.network/types";
import { toast } from "@/toast";

type Props = {
  symbol: string;
  maxQty: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  position: API.PositionTPSLExt;
  order?: API.AlgoOrder;
  canModifyQty?: boolean;
};
export const TPSLEditor: FC<Props> = (props) => {
  const { symbol, maxQty } = props;

  const [order, { submit, setValue }] = useTaskProfitAndStopLoss(
    {
      symbol,
      position_qty: maxQty,
      average_open_price: props.position.average_open_price,
    },
    {
      defaultOrder: props.order,
    }
  );

  const onSubmit = () => {
    // check the order status, if it is a new order, then create it, otherwise update it,
    // if the quantity is not equal to the position quantity, then create new TP/SL order
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
      maxQty={maxQty}
      onChange={setValue}
      symbol={symbol}
      onSubmit={onSubmit}
      onCancel={props.onCancel}
      order={order}
      canModifyQty={props.canModifyQty}
    />
  );
};
