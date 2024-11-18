import Button from "@/button";
import { Divider } from "@/divider";
import { Input } from "@/input";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { Text } from "@/text";
import { type API } from "@orderly.network/types";
import { FC, useCallback, useEffect, useMemo } from "react";
import { LimitConfirm } from "./limitConfirm";
import { modal } from "@orderly.network/ui";
import {
  useSymbolsInfo,
  useOrderEntry_deprecated,
} from "@orderly.network/hooks";
import { Controller, useForm } from "react-hook-form";
import { OrderSide, OrderType } from "@orderly.network/types";
import { toast } from "@/toast";
import { OrderEntity } from "@orderly.network/types";

export interface ClosePositionPaneProps {
  position?: API.Position;
  onConfirm?: () => void;
  needConfirm?: boolean;
  side: OrderSide;

  onCancel?: () => void;
  onClose: (res: any) => void;
}

export const ClosePositionPane: FC<ClosePositionPaneProps> = (props) => {
  const { position, side } = props;

  // const { hide, reject, resolve } = useModal();

  const { markPrice, maxQty, helper, onSubmit } = useOrderEntry_deprecated(
    position?.symbol!,
    side,
    true
  );

  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    formState: { errors, submitCount, isSubmitting },
  } = useForm({
    values: {
      order_price: Math.abs(position?.mark_price!),
      order_quantity: Math.abs(position?.position_qty!),
      symbol: position?.symbol,
      order_type: OrderType.LIMIT,
      side: side,
    },
    resolver: async (values) => {
      const errors = await helper.validator(values as any);
      return {
        values,
        errors,
      };
    },
  });

  useEffect(() => {
    // init order_price value
    if (getValues()?.order_price === undefined) {
      //@ts-ignore
      setValue("order_price", markPrice);
    }
  }, [markPrice]);

  const symbolInfo = useSymbolsInfo()[position?.symbol!];

  //

  const base = useMemo(() => symbolInfo("base"), [symbolInfo]);
  const quote = useMemo(() => symbolInfo("quote"), [symbolInfo]);
  const quoteDp = useMemo(() => symbolInfo("quote_dp"), [symbolInfo]);

  const typeText = useMemo(() => {
    if (side === OrderSide.SELL) return <Text type={"sell"}>Limit Sell</Text>;
    return <Text type={"buy"}>Limit Buy</Text>;
  }, [side]);

  const onConfirm = (data: any) => {
    return modal.confirm({
      title: "Limit Close",
      onCancel: () => {
        return Promise.reject();
      },
      content: (
        <LimitConfirm order={data} base={base} quote={quote} side={side} />
      ),
    });
  };

  const onFormSubmit = (data: any) => {
    return onConfirm(data).then(
      () => {
        return onSubmit({ ...data, reduce_only: true }).then(
          (res: any) => {
            //
            if (res.success) {
              // toast.success("successfully");
            }
            props.onClose(res);
          },
          (error: Error) => {
            toast.error(error.message);
          }
        );
      },
      () => {}
    );
  };

  const onFieldChange = (name: string, value: any) => {
    const newValues = helper.calculate(
      getValues() as any,
      name as keyof OrderEntity,
      value
    );

    if (name === "order_price") {
      // @ts-ignore
      setValue("order_price", newValues.order_price, {
        shouldValidate: submitCount > 0,
      });
    }
    // @ts-ignore
    setValue("order_quantity", newValues.order_quantity, {
      shouldValidate: submitCount > 0,
    });
  };

  if (!position) return null;

  return (
    <>
      <div className="orderly-pb-3 orderly-pt-5 orderly-text-xs">
        <Text rule="symbol">{position.symbol}</Text>
      </div>
      <div className="orderly-grid orderly-grid-cols-2">
        <Statistic
          label="Order type"
          value={typeText}
          valueClassName="orderly-text-2xs"
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
        />
        <Statistic
          label="Last price"
          value={markPrice}
          precision={quoteDp}
          rule="price"
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs"
        />
      </div>
      <Divider className="orderly-py-5" />
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="orderly-flex orderly-flex-col orderly-gap-5">
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
                  helpText={errors.order_price?.message}
                  error={!!errors.order_price}
                  className="orderly-text-right orderly-text-3xs"
                  containerClassName={
                    "orderly-bg-base-500 orderly-rounded-borderRadius"
                  }
                  value={field.value}
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
                  max={Math.abs(position.position_qty)}
                  color={"buy"}
                  markCount={4}
                  value={[Number(field.value ?? 0)]}
                  onValueChange={(value) => {
                    // if (typeof value[0] !== "undefined") {
                    //   field.onChange(value[0]);
                    // }
                    setValue("order_quantity", value[0]);
                  }}
                />
              );
            }}
          />
        </div>

        <div className="orderly-grid orderly-grid-cols-2 orderly-text-xs orderly-gap-3 orderly-py-5">
          <Button
            variant="contained"
            color="tertiary"
            fullWidth
            type="button"
            onClick={() => {
              props.onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button fullWidth type="submit" loading={isSubmitting}>
            Confirm
          </Button>
        </div>
      </form>
    </>
  );
};
