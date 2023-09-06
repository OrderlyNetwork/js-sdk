"use client";

import { Input } from "@/input";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { Slider } from "@/slider";
import {
  FC,
  FormEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Picker } from "@/select";
import Button from "@/button";
import { Numeral, Text } from "@/text";

import { Divider } from "@/divider";
import { OrderOptions } from "./sections/orderOptions";
// import {useMaxQty} from '@orderly.network/hooks'

import { API, OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { modal } from "@/modal";
import { OrderConfirmView } from "./sections/orderConfirmView";
import { toast } from "@/toast";
import { StatusGuardButton } from "@/button/statusGuardButton";

export interface OrderEntryProps {
  onSubmit?: (data: any) => Promise<any>;
  onDeposit?: () => Promise<void>;

  markPrice?: number;
  maxQty: number;

  symbol: string;

  symbolConfig: API.SymbolExt;

  freeCollateral?: number;

  showConfirm?: boolean;
  onConfirmChange?: (value: boolean) => void;

  reduceOnly?: boolean;
  onReduceOnlyChange?: (value: boolean) => void;

  side: OrderSide;
  onSideChange?: (value: OrderSide) => void;

  helper: any;

  disabled?: boolean;
}

interface OrderEntryRef {
  reset: () => void;
  setValues: (values: Partial<OrderEntity>) => void;
  setValue: (name: keyof OrderEntity, value: any) => void;
}

const { Segmented: SegmentedButton } = Button;

export const OrderEntry = forwardRef<OrderEntryRef, OrderEntryProps>(
  (props, ref) => {
    const {
      freeCollateral,
      symbolConfig,
      maxQty,
      symbol,
      side,
      onSideChange,
      helper,
      disabled,
    } = props;

    const { calculate, validator } = helper;

    const methods = useForm({
      // mode: "onChange",
      reValidateMode: "onChange",
      defaultValues: {
        side: OrderSide.BUY,
        order_type: OrderType.LIMIT,
        order_quantity: "",
        total: "",
        order_price: "",
        reduce_only: false,
      },
      resolver: async (values) => {
        console.log("**********  values", values);
        const errors = await validator(values);
        return {
          values,
          errors,
        };
      },
    });

    const [buttonText, setButtonText] = useState<string>("Buy / Long");

    const priceInputRef = useRef<HTMLInputElement | null>(null);

    const onSubmit = useCallback(
      (data: any) => {
        // console.log("data", data);

        return modal
          .confirm({
            title: "Confirm Order",
            content: (
              <OrderConfirmView
                order={{ ...data, side: props.side, symbol: props.symbol }}
                symbol={symbol}
                base={symbolConfig["base"]}
                quote={symbolConfig.quote}
              />
            ),
          })
          .then((isOk) => {
            return props
              .onSubmit?.({
                ...data,
                side: props.side,
                symbol: props.symbol,
              })
              .then(
                (res) => {
                  if (res.success) {
                    methods.reset({
                      order_type: data.order_type,
                      order_price: "",
                      order_quantity: "",
                      total: "",
                    });
                    toast.success("Successfully!");
                  }

                  // resetForm?.();
                },
                (error: Error) => {
                  toast.error(error.message);
                }
              );
          });
      },
      [side, props.onSubmit, symbol]
    );

    useEffect(() => {
      console.log("swith symbol");
      methods.clearErrors();
      methods.reset({
        // order_type: data.order_type,
        order_price: "",
        order_quantity: "",
        total: "",
      });
    }, [symbol]);

    const onDeposit = useCallback((event: FormEvent) => {
      event.preventDefault();
      props.onDeposit?.();
    }, []);

    useEffect(() => {
      if (side === OrderSide.BUY) {
        setButtonText("Buy / Long");
      } else {
        setButtonText("Sell / Short");
      }
    }, [side]);

    useEffect(() => {
      const subscription = methods.watch((value, { name, type }) => {
        if (type === "change") {
          if (name === "reduce_only") {
            props.onReduceOnlyChange?.(!!value["reduce_only"]);
          }
        }
      });
      return () => subscription.unsubscribe();
    }, []);

    const onFieldChange = (name: string, value: any) => {
      const newValues = calculate(methods.getValues(), name, value);
      // console.log("newValues", newValues);

      if (name === "order_price") {
        methods.setValue("order_price", newValues.order_price, {
          shouldValidate: methods.formState.submitCount > 0,
        });
      }

      methods.setValue("total", newValues.total, {
        shouldValidate: methods.formState.submitCount > 0,
      });
      methods.setValue("order_quantity", newValues.order_quantity, {
        shouldValidate: methods.formState.submitCount > 0,
      });
    };

    return (
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            <SegmentedButton
              buttons={[
                {
                  label: "Buy",
                  value: OrderSide.BUY,
                  disabled,
                  activeClassName:
                    "bg-trade-profit text-trade-profit-foreground after:bg-trade-profit",
                  disabledClassName:
                    "bg-[#394155] text-white/10 after:bg-[#394155] cursor-not-allowed",
                },
                {
                  label: "Sell",
                  value: OrderSide.SELL,
                  disabled,
                  activeClassName:
                    "bg-trade-loss text-trade-loss-foreground after:bg-trade-loss",
                  disabledClassName:
                    "bg-[#394155] text-white/10 after:bg-[#394155] cursor-not-allowed",
                },
              ]}
              onChange={(value) => {
                onSideChange?.(value as OrderSide);
              }}
              value={side}
            />

            <div className={"flex justify-between items-center"}>
              <div className="flex gap-1 text-gray-500 text-sm">
                <span>Free Collat.</span>
                <Numeral rule="price" className="text-base-contrast/80">{`${
                  freeCollateral ?? "--"
                }`}</Numeral>

                <span>USDC</span>
              </div>
              <Button
                variant={"text"}
                color="primary"
                size={"small"}
                type="button"
                onClick={onDeposit}
              >
                Deposit
              </Button>
            </div>
            <Controller
              name="order_type"
              control={methods.control}
              render={({ field }) => {
                return (
                  <Picker
                    label={"Order Type"}
                    value={field.value}
                    color={side === OrderSide.BUY ? "buy" : "sell"}
                    options={[
                      { label: "Limit Order", value: "LIMIT" },
                      {
                        label: "Market Order",
                        value: "MARKET",
                      },
                    ]}
                    onValueChange={(value: any) => {
                      // setValue?.("order_type", value.value);
                      field.onChange(value.value);
                      methods.setValue("order_price", "", {
                        shouldValidate: true,
                      });
                    }}
                  />
                );
              }}
            />

            <Controller
              name="order_price"
              control={methods.control}
              render={({ field }) => {
                return (
                  <Input
                    ref={priceInputRef}
                    prefix={"Price"}
                    suffix={symbolConfig?.quote}
                    error={!!methods.formState.errors?.order_price}
                    helpText={methods.formState.errors?.order_price?.message}
                    value={
                      methods.getValues("order_type") === OrderType.MARKET
                        ? "Market"
                        : field.value
                    }
                    className="text-right"
                    readOnly={
                      methods.getValues("order_type") === OrderType.MARKET
                    }
                    onChange={(event) => {
                      // field.onChange(event.target.value);
                      onFieldChange("order_price", event.target.value);
                    }}
                  />
                );
              }}
            />

            <Controller
              name="order_quantity"
              control={methods.control}
              render={({ field }) => {
                return (
                  <Input
                    prefix={"Qunatity"}
                    suffix={symbolConfig?.base}
                    className="text-right"
                    error={!!methods.formState.errors?.order_quantity}
                    helpText={methods.formState.errors?.order_quantity?.message}
                    value={field.value}
                    onChange={(event) => {
                      onFieldChange("order_quantity", event.target.value);
                    }}
                  />
                );
              }}
            />

            <Controller
              name="order_quantity"
              control={methods.control}
              render={({ field }) => {
                return (
                  <Slider
                    color={side === OrderSide.BUY ? "buy" : "sell"}
                    min={0}
                    max={maxQty}
                    markCount={4}
                    disabled={maxQty === 0}
                    step={symbolConfig?.["base_tick"]}
                    value={[Number(field.value ?? 0)]}
                    onValueChange={(value) => {
                      // console.log("onValueChange", value);
                      if (typeof value[0] !== "undefined") {
                        // field.onChange(value[0]);
                        onFieldChange("order_quantity", value[0]);
                      }
                    }}
                  />
                );
              }}
            />

            <Controller
              name="total"
              control={methods.control}
              render={({ field }) => {
                return (
                  <Input
                    className={"text-right"}
                    // value={values?.total}
                    prefix={"Total ≈"}
                    suffix={symbolConfig?.quote}
                    value={field.value}
                    onChange={(event) => {
                      // field.onChange(event.target.value);
                      onFieldChange("total", event.target.value);
                    }}
                  />
                );
              }}
            />

            <Divider />
            <OrderOptions
              showConfirm={props.showConfirm}
              onConfirmChange={props.onConfirmChange}
            />
            <StatusGuardButton>
              <Button
                type="submit"
                loading={methods.formState.isSubmitting}
                color={side === OrderSide.BUY ? "buy" : "sell"}
                fullWidth
              >
                {buttonText}
              </Button>
            </StatusGuardButton>
          </div>
        </form>
      </FormProvider>
    );
  }
);
