import { FC, useCallback, useContext, useMemo } from "react";
import Button from "@/button";
import { Divider } from "@/divider";
import { Input } from "@/input";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { Text } from "@/text";
import { useOrderEntry, useSymbolsInfo } from "@orderly.network/hooks";
import { API, OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { Controller, useForm } from "react-hook-form";
import { modal } from "@/modal";
import { toast } from "@/toast";
import { commify } from "@orderly.network/utils";
import { OrderListContext } from "../../orderListContext";

interface OrderEditFormProps {
  // symbol: string;
  order: API.Order;
  onSubmit: (values: OrderEntity) => Promise<any>;
  // onComplete?: (values: OrderEntity) => void;
  onCancel: () => void;
}

export const OrderEditForm: FC<OrderEditFormProps> = (props) => {
  const { order, onSubmit } = props;

  // const { hide, reject, resolve } = useModal();

  const { markPrice, maxQty, helper } = useOrderEntry(order.symbol, order.side);

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
      symbol: order.symbol,
      order_type: order.type,
      side: order.side,
      reduce_only: Boolean(order.reduce_only),
    },
    // values: {

    // },
    resolver: async (values) => {
      const errors = await helper.validator(values);
      return {
        values,
        errors,
      };
    },
  });

  const symbolInfo = useSymbolsInfo()[order.symbol];

  //

  const base = useMemo(() => symbolInfo("base"), [symbolInfo]);
  const quote = useMemo(() => symbolInfo("quote"), [symbolInfo]);

  const typeText = useMemo(() => {
    if (order.side === OrderSide.SELL)
      return <Text type={"sell"}>Limit Sell</Text>;
    return <Text type={"buy"}>Limit Buy</Text>;
  }, [order]);

  const onConfirm = (data: OrderEntity, dirtyFields: any) => {
    let alertText;

    if (dirtyFields["order_price"] && dirtyFields["order_quantity"]) {
      alertText = (
        <div className="orderly-text-base-contrast-54 orderly-text-2xs">
          You agree changing the price of ETH-PERP order to{" "}
          <span className="orderly-text-warning">{commify(data.order_price!)}</span> and
          the quantity to{" "}
          <span className="orderly-text-warning">{commify(data.order_quantity!)}</span>.
        </div>
      );
    } else {
      if (dirtyFields["order_price"]) {
        alertText = (
          <div className="orderly-text-base-contrast-54 orderly-text-2xs">
            You agree changing the price of ETH-PERP order to{" "}
            <span className="orderly-text-warning">{commify(data.order_price!)}</span>.
          </div>
        );
      }

      if (dirtyFields["order_quantity"]) {
        alertText = (
          <div className="orderly-text-base-contrast-54 orderly-text-2xs">
            You agree changing the quantity of ETH-PERP order to{" "}
            <span className="orderly-text-warning">
              {commify(data.order_quantity!)}
            </span>
            .
          </div>
        );
      }
    }

    return modal.confirm({
      title: "Edit Order",
      content: alertText,
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
          return onSubmit(data);
        },
        () => {}
      );
    },
    [quote, order, dirtyFields]
  );

  const onFieldChange = (name: string, value: any) => {
    const newValues = helper.calculate(getValues(), name, value);
    //

    if (name === "order_price") {
      setValue("order_price", newValues.order_price, {
        shouldValidate: submitCount > 0,
        shouldDirty: true,
      });
    }

    setValue("order_quantity", newValues.order_quantity, {
      shouldValidate: submitCount > 0,
      shouldDirty: true,
    });
  };

  if (!order) return null;

  return (
    <>
      <div className="orderly-pb-3 orderly-pt-5 orderly-text-xs">
        <Text rule="symbol">{order.symbol}</Text>
      </div>
      <div className="orderly-grid orderly-grid-cols-2">
        <Statistic
          label="Order type"
          value={typeText}
          valueClassName="orderly-text-2xs"
          labelClassName="orderly-text-4xs-contrast-36"
        />
        <Statistic
          label="Last price"
          value={markPrice}
          rule="price"
          labelClassName="orderly-text-4xs-contrast-36"
          valueClassName="orderly-text-2xs"
        />
      </div>
      <Divider className="orderly-py-5" />
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="orderly-flex orderly-flex-col orderly-gap-5">
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
                  helpText={errors.order_price?.message}
                  error={!!errors.order_price}
                  className="orderly-text-right orderly-text-3xs"
                  value={field.value!}
                  onChange={(e) => {
                    // field.onChange(e.target.value)
                    onFieldChange("order_price", e.target.value);
                  }}
                />
              );
            }}
          />
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

        <div className="orderly-grid orderly-grid-cols-2 orderly-gap-3 orderly-py-5">
          <Button
            fullWidth
            type="button"
            variant={"outlined"}
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
    </>
  );
};
