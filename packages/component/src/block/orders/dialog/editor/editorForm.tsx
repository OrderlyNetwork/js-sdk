import { FC, useCallback, useContext, useMemo } from "react";
import Button from "@/button";
import { Divider } from "@/divider";
import { Input } from "@/input";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { Text } from "@/text";
import {
  useOrderEntry_deprecated,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { API, OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { Controller, useForm } from "react-hook-form";
import { modal } from "@orderly.network/ui";
import { toast } from "@/toast";
import { commify } from "@orderly.network/utils";
import { OrderListContext } from "../../shared/orderListContext";
import { EditOrderConfirmContent } from "../../shared/confirmContent";

interface OrderEditFormProps {
  // symbol: string;
  order: API.Order;
  onSubmit: (values: OrderEntity) => Promise<any>;
  // onComplete?: (values: OrderEntity) => void;
  onCancel: () => void;
}

export const OrderEditForm: FC<OrderEditFormProps> = (props) => {
  const { order, onSubmit } = props;

  const isAlgoOrder = order.algo_order_id !== undefined;
  const isMarket = order.type === "MARKET";
  // const { hide, reject, resolve } = useModal();
  // @ts-ignore
  const { markPrice, maxQty, helper, metaState } = useOrderEntry_deprecated(
    // @ts-ignore
    order.symbol,
    order.side
  );

  const orderType = useMemo(() => {
    if (isAlgoOrder) {
      return `STOP_${order.type}`;
    }

    return order.type;
  }, [order, isAlgoOrder]);

  const {
    handleSubmit,
    control,
    getValues,
    setValue,

    formState: { errors, submitCount, isSubmitting, isDirty, dirtyFields },
  } = useForm({
    defaultValues: {
      order_price: order.price?.toString(),
      order_quantity: order.quantity.toString(),
      trigger_price: order.trigger_price?.toString(),
      symbol: order.symbol,
      order_type: orderType,
      side: order.side,
      reduce_only: Boolean(order.reduce_only),
    },
    // values: {

    // },
    resolver: async (values) => {
      // @ts-ignore
      const errors = await helper.validator(values);
      if (errors.total?.message !== undefined) {
        toast.error(errors.total?.message);
      }

      return {
        values,
        errors,
      };
    },
  });

  // console.log("editor form ", order);

  const symbolInfo = useSymbolsInfo()[order.symbol];

  //

  const base = useMemo(() => symbolInfo("base"), [symbolInfo]);
  const quote = useMemo(() => symbolInfo("quote"), [symbolInfo]);
  const quoteDP = useMemo(() => symbolInfo("quote_dp"), [symbolInfo]);

  const typeText = useMemo(() => {
    if (order.side === OrderSide.SELL)
      return <Text type={"sell"}>Limit Sell</Text>;
    return <Text type={"buy"}>Limit Buy</Text>;
  }, [order]);

  const onConfirm = (data: OrderEntity, dirtyFields: any) => {
    return modal.confirm({
      title: "Edit Order",
      content: EditOrderConfirmContent(
        isAlgoOrder,
        isMarket,
        data,
        dirtyFields,
        base,
        order.symbol
      ),
      contentClassName: "desktop:orderly-w-[340px]",
      onOk: () => Promise.resolve(data),
      onCancel: () => {
        return Promise.reject();
      },
    });
  };

  const onFormSubmit = useCallback(
    (data: any) => {
      return onConfirm(data, dirtyFields).then(
        (data: any) => {
          if (isAlgoOrder && order.type === 'MARKET' && 'order_price' in data) {
            const { order_price, ...rest} = data;
            return onSubmit(rest);
          }
          return onSubmit(data);
        },
        () => {}
      );
    },
    [quote, order, dirtyFields]
  );

  const onFieldChange = (name: string, value: any) => {
    // @ts-ignore
    const newValues = helper.calculate(getValues(), name, value);
    //

    if (name === "trigger_price") {
      // @ts-ignore
      setValue("trigger_price", newValues.trigger_price, {
        shouldValidate: submitCount > 0,
        shouldDirty: true,
      });
    } else {
      if (name === "order_price") {
        // @ts-ignore
        setValue("order_price", newValues.order_price, {
          shouldValidate: submitCount > 0,
          shouldDirty: true,
        });
      }
      // @ts-ignore
      setValue("order_quantity", newValues.order_quantity, {
        shouldValidate: submitCount > 0,
        shouldDirty: true,
      });
    }
  };

  if (!order) return null;

  return (
    <div id="orderly-orders-editor-form">
      <div className="orderly-pb-3 orderly-pt-5 orderly-text-xs">
        <Text rule="symbol">{order.symbol}</Text>
      </div>
      <div className="orderly-grid orderly-grid-cols-2">
        {/* orderly-text-4xs orderly-text-base-contrast-36 */}
        <Statistic
          label="Order type"
          value={typeText}
          valueClassName="orderly-text-2xs"
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
        />
        <Statistic
          label="Last price"
          value={markPrice}
          rule="price"
          precision={quoteDP || 2}
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs"
        />
      </div>
      <Divider className="orderly-py-5" />
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="orderly-flex orderly-flex-col orderly-gap-5">
          {/* @ts-ignore */}
          {isAlgoOrder && (
            // @ts-ignore
            <Controller
              name="trigger_price"
              control={control}
              render={({ field }) => {
                return (
                  <Input
                    prefix="Trigger price"
                    suffix={quote}
                    type="text"
                    inputMode="decimal"
                    containerClassName="orderly-bg-base-500 orderly-rounded-borderRadius"
                    helpText={errors.trigger_price?.message}
                    error={!!errors.trigger_price}
                    className="orderly-text-right orderly-text-3xs"
                    value={field.value!}
                    onChange={(e) => {
                      // field.onChange(e.target.value)
                      onFieldChange("trigger_price", e.target.value);
                    }}
                  />
                );
              }}
            />
          )}
          {/* @ts-ignore */}
          <Controller
            name="order_price"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  prefix="Price"
                  suffix={quote}
                  type="text"
                  inputMode="decimal"
                  containerClassName="orderly-bg-base-500 orderly-rounded-borderRadius"
                  helpText={errors.order_price?.message}
                  error={!!errors.order_price}
                  className="orderly-text-right orderly-text-3xs"
                  value={isMarket ? "Market" : field.value!}
                  disabled={isMarket}
                  onChange={(e) => {
                    // field.onChange(e.target.value)
                    onFieldChange("order_price", e.target.value);
                  }}
                />
              );
            }}
          />
          {/* @ts-ignore */}
          <Controller
            name="order_quantity"
            control={control}
            render={({ field }) => {
              return (
                <Input
                  prefix="Quantity"
                  suffix={base}
                  type="text"
                  inputMode="decimal"
                  containerClassName="orderly-bg-base-500 orderly-rounded-borderRadius"
                  helpText={errors.order_quantity?.message}
                  error={!!errors.order_quantity}
                  className="orderly-text-right orderly-text-3xs"
                  value={field.value}
                  onChange={(e) => {
                    // field.onChange(e.target.value)
                    onFieldChange("order_quantity", e.target.value);
                  }}
                />
              );
            }}
          />
        </div>

        <div className="orderly-py-5">
          {/* @ts-ignore */}
          <Controller
            name="order_quantity"
            control={control}
            render={({ field }) => {
              //
              return (
                <Slider
                  step={symbolInfo("base_tick")}
                  min={0}
                  max={maxQty}
                  color={"buy"}
                  markCount={4}
                  value={[Number(field.value ?? 0)]}
                  onValueChange={(value) => {
                    onFieldChange("order_quantity", value[0].toString());
                  }}
                />
              );
            }}
          />
        </div>

        <div className="orderly-grid orderly-grid-cols-2 orderly-gap-3 orderly-py-5 orderly-text-xs">
          <Button
            fullWidth
            variant="contained"
            color="tertiary"
            type="button"
            onClick={() => {
              props.onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Confirm
          </Button>
        </div>
      </form>
    </div>
  );
};
