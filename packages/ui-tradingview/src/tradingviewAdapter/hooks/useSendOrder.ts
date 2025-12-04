import { useOrderEntry_deprecated } from "@veltodefi/hooks";
import { OrderSide, OrderType } from "@veltodefi/types";
import { Decimal } from "@veltodefi/utils";
import { toast } from "@veltodefi/ui";

export default function useSendOrder(symbol: string) {
  const { onSubmit: _sendMarketOrder } = useOrderEntry_deprecated(
    {
      symbol,
      side: OrderSide.BUY,
      order_type: OrderType.MARKET,
    },
    {
      watchOrderbook: true,
    }
  );
  const _sendOrder = () => {};

  const sendLimitOrder = () => {};

  const sendMarketOrder = (data: any) => {
    console.log("-order DAta", data);
    data.reduce_only = false;
    return _sendMarketOrder(data).catch((e) => {
      console.log("--- e", e);
      toast.error(e);
    });
  };

  return {
    sendLimitOrder,
    sendMarketOrder,
  };
}
