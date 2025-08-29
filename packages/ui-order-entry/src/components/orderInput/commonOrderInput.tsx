import { OrderType } from "@orderly.network/types";
import { type OrderInputProps } from ".";
import { PriceInput } from "./limit/priceInput";
import { QtyAndTotalInput } from "./qtyAndTotalInput";
import { TriggerPriceInput } from "./stop/triggerPriceInput";
import { ActivePriceInput } from "./trailingStop/activePriceInput";
import { TrailingCallbackInput } from "./trailingStop/trailingCallbackInput";

export const CommonOrderInput = (props: OrderInputProps) => {
  const { type, values, bbo, fillMiddleValue } = props;

  const showTriggerPrice =
    type === OrderType.STOP_LIMIT || type === OrderType.STOP_MARKET;

  const showPrice = type === OrderType.LIMIT || type === OrderType.STOP_LIMIT;

  const showActivatedPrice = type === OrderType.TRAILING_STOP;

  const showTrailingCallback = type === OrderType.TRAILING_STOP;

  const triggerPriceInput = showTriggerPrice && (
    <TriggerPriceInput
      trigger_price={values.trigger_price}
      triggerPriceInputRef={props.refs.triggerPriceInputRef}
    />
  );

  const priceInput = showPrice && (
    <PriceInput
      order_type={values.order_type!}
      order_price={values.order_price}
      bbo={bbo}
      refs={props.refs}
      fillMiddleValue={fillMiddleValue}
    />
  );

  const activatedPriceInput = showActivatedPrice && (
    <ActivePriceInput
      activated_price={values.activated_price}
      activatedPriceInputRef={props.refs.activatedPriceInputRef}
    />
  );

  const trailingCallbackInput = showTrailingCallback && (
    <TrailingCallbackInput
      callback_value={values.callback_value}
      callback_rate={values.callback_rate}
    />
  );

  return (
    <div className={"oui-space-y-1"}>
      {triggerPriceInput}
      {priceInput}

      {activatedPriceInput}
      {trailingCallbackInput}

      <QtyAndTotalInput
        order_quantity={values.order_quantity}
        total={values.total}
      />
    </div>
  );
};
