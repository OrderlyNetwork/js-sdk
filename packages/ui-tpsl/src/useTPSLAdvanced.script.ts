import { useOrderEntry } from "@orderly.network/hooks";
import { OrderlyOrder } from "@orderly.network/types";

type Props = {
  order: OrderlyOrder;
  setOrderValue: (key: string, value: any) => void;
  onSubmit: (formattedOrder: OrderlyOrder) => void;
};

export const useTPSLAdvanced = (props: Props) => {
  const { order, setOrderValue } = props;
  const { formattedOrder, setValue, setValues, symbolInfo, ...state } =
    useOrderEntry(order.symbol, {
      initialOrder: {
        symbol: order.symbol,
        order_type: order.order_type,
        side: order.side,
        order_price: order.order_price,
        order_quantity: order.order_quantity,
        position_type: order.position_type,
        trigger_price: order.trigger_price,
        tp_trigger_price: order.tp_trigger_price,
        sl_trigger_price: order.sl_trigger_price,
        tp_order_price: order.tp_order_price,
        sl_order_price: order.sl_order_price,
        tp_order_type: order.tp_order_type,
        sl_order_type: order.sl_order_type,
        tp_pnl: order.tp_pnl,
        sl_pnl: order.sl_pnl,
      },
    });

  const onSubmit = () => {
    props.onSubmit(formattedOrder as OrderlyOrder);
  };
  return {
    order,
    formattedOrder,
    symbolInfo,
    setValue,
    onSubmit,
  };
};
