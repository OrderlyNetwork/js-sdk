import Button from "@/button";

import { Divider } from "@/divider";
import { Input } from "@/input";
import { Slider } from "@/slider";
import { Statistic } from "@/statistic";
import { Text } from "@/text";
import { type API } from "@orderly.network/core";
import { Info } from "lucide-react";
import { FC, useCallback, useMemo } from "react";
import { LimitConfirm } from "./limitConfirm";
import { modal, useModal } from "@/modal";
import {
  useSymbolsInfo,
  useMarkPricesStream,
  useOrderEntry,
} from "@orderly.network/hooks";
import { Controller, useForm } from "react-hook-form";
import { OrderSide, OrderType } from "@orderly.network/types";
import { toast } from "@/toast";

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

  const { markPrice, maxQty, helper, onSubmit } = useOrderEntry(
    position?.symbol,
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
    defaultValues: {
      order_price: markPrice,
    },
    values: {
      // order_price: "",
      order_quantity: Math.abs(position?.position_qty),
      symbol: position?.symbol,
      order_type: OrderType.LIMIT,
      side: side,
    },
    resolver: async (values) => {
      const errors = await helper.validator(values);
      return {
        values,
        errors,
      };
    },
  });

  const symbolInfo = useSymbolsInfo()[position?.symbol];

  // console.log(symbolInfo());

  const base = useMemo(() => symbolInfo("base"), [symbolInfo]);
  const quote = useMemo(() => symbolInfo("quote"), [symbolInfo]);

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

  const onFormSubmit = useCallback(
    (data: any) => {
      return onConfirm(data).then(
        () => {
          return onSubmit({ ...data, reduce_only: true }).then(
            (res: any) => {
              // console.log(res);
              if (res.success) {
                toast.success("successfully");
              }
              props.onClose(res);
            },
            (error: Error) => {
              toast.error(error.message);
            }
          );
        },
        () => {
          console.log("cancel");
        }
      );
    },
    [side, quote]
  );

  const onFieldChange = (name: string, value: any) => {
    const newValues = helper.calculate(getValues(), name, value);
    // console.log("newValues", newValues);

    if (name === "order_price") {
      setValue("order_price", newValues.order_price, {
        shouldValidate: submitCount > 0,
      });
    }

    setValue("order_quantity", newValues.order_quantity, {
      shouldValidate: submitCount > 0,
    });
  };

  if (!position) return null;

  return (
    <>
      <div className="pb-3 pt-5">
        <Text rule="symbol">{position.symbol}</Text>
      </div>
      <div className="grid grid-cols-2">
        <Statistic
          label="Order Type"
          value={typeText}
          labelClassName="text-sm text-base-contrast/30"
        />
        <Statistic
          label="Last Price"
          value={markPrice}
          rule="price"
          labelClassName="text-sm text-base-contrast/30"
        />
      </div>
      <Divider className="py-5" />
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <div className="flex flex-col gap-5">
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
                  className="text-right"
                  autoFocus
                  value={field.value}
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
                  className="text-right"
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

        <div className="py-5">
          <Controller
            name="order_quantity"
            control={control}
            render={({ field }) => {
              // console.log([Number(field.value ?? 0)], symbolInfo("base_tick"));
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

        <div className="grid grid-cols-2 gap-3 py-5">
          <Button
            fullWidth
            type="button"
            color={"secondary"}
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
