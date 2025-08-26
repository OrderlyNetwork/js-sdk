import { OrderType } from "@orderly.network/types";
import { type OrderInputProps } from ".";
import { PriceInput } from "./limit/priceInput";
import { QtyAndTotalInput } from "./qtyAndTotalInput";
import { TriggerPriceInput } from "./stop/triggerPriceInput";
import { ActivePriceInput } from "./trailingStop/activePriceInput";
import { TrailingValueInput } from "./trailingStop/trailingValueInput";

export const CommonOrderInput = (props: OrderInputProps) => {
  const { type, values, bbo, fillMiddleValue } = props;

  const triggerPriceInput = (type === OrderType.STOP_LIMIT ||
    type === OrderType.STOP_MARKET) && (
    <TriggerPriceInput
      trigger_price={values.trigger_price}
      triggerPriceInputRef={props.refs.triggerPriceInputRef}
    />
  );

  const priceInput = (type === OrderType.LIMIT ||
    type === OrderType.STOP_LIMIT) && (
    <PriceInput
      order_type={values.order_type!}
      order_price={values.order_price}
      bbo={bbo}
      refs={props.refs}
      fillMiddleValue={fillMiddleValue}
    />
  );

  const activationPriceInput = type === OrderType.TRAILING_STOP && (
    <ActivePriceInput
      activated_price={values.activated_price}
      activatedPriceInputRef={props.refs.activatedPriceInputRef}
    />
  );

  const trailingValueInput = type === OrderType.TRAILING_STOP && (
    <TrailingValueInput
      callback_value={values.callback_value}
      callback_rate={values.callback_rate}
    />
  );

  return (
    <div className={"oui-space-y-1"}>
      {priceInput}
      {triggerPriceInput}

      {activationPriceInput}
      {trailingValueInput}

      <QtyAndTotalInput
        order_quantity={values.order_quantity}
        total={values.total}
      />
    </div>
  );
};
