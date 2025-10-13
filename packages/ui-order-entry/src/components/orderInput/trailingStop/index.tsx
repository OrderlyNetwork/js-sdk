import { OrderlyOrder } from "@kodiak-finance/orderly-types";
import { QtyAndTotalInput } from "../qtyAndTotalInput";
import { ActivePriceInput } from "./activePriceInput";
import { TrailingCallbackInput } from "./trailingCallbackInput";

type TrailingStopInputProps = {
  values: Partial<OrderlyOrder>;
};

export const TrailingStopInput = (props: TrailingStopInputProps) => {
  const { values } = props;

  return (
    <>
      <ActivePriceInput activated_price={values.activated_price} />
      <TrailingCallbackInput
        callback_value={values.callback_value}
        callback_rate={values.callback_rate}
      />
      <QtyAndTotalInput
        order_quantity={values.order_quantity}
        total={values.total}
      />
    </>
  );
};
