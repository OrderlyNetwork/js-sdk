import { Input } from "@/input";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { Slider } from "@/slider";
import React, {
  FC,
  FormEvent,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Picker, Select } from "@/select";
import Button from "@/button";
import { Numeral, Text } from "@/text";

import { Divider } from "@/divider";
import { OrderOptions } from "./sections/orderOptions";
import {
  useEventEmitter,
  useLocalStorage,
  useDebounce,
} from "@orderly.network/hooks";

import { API, OrderEntity, OrderSide, OrderType } from "@orderly.network/types";
import { modal } from "@/modal";
import { OrderConfirmView } from "./sections/orderConfirmView.new";
import { toast } from "@/toast";
import { StatusGuardButton } from "@/button/statusGuardButton";
import { Decimal, commify } from "@orderly.network/utils";
import { MSelect } from "@/select/mSelect";
import { cn } from "@/utils/css";
import { convertValueToPercentage } from "@/slider/utils";
import { FreeCollat } from "./sections/freeCollat";
import { EstInfo } from "./sections/setInfo";

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
      onReduceOnlyChange,
      helper,
      disabled,
      markPrice,
    } = props;

    const { calculate, validator } = helper;

    const totalInputFocused = useRef<boolean>(false);
    const priceInputFocused = useRef<boolean>(false);
    const quantityInputFocused = useRef<boolean>(false);
    const isClickForm = useRef(false);

    const [needConfirm, setNeedConfirm] = useLocalStorage(
      "orderly_order_confirm",
      true
    );

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
        const errors = await validator(values);
        // 当Price聚集输入而Quantity没有聚集的时候，Quantity报错不提示
        if (
          priceInputFocused.current &&
          !quantityInputFocused.current &&
          errors.order_quantity
        ) {
          delete errors.order_quantity;
        }

        return {
          values,
          errors,
        };
      },
    });

    const ee = useEventEmitter();

    const orderbookItemClickHandler = useCallback((item: number[]) => {
      methods.setValue("order_price", item[0].toString());
      methods.setValue("order_type", OrderType.LIMIT);
    }, []);

    useEffect(() => {
      ee.on("orderbook:item:click", orderbookItemClickHandler);

      () => {
        ee.off("orderbook:item:click", orderbookItemClickHandler);
      };
    }, []);

    const [buttonText, setButtonText] = useState<string>("Buy / Long");

    const priceInputRef = useRef<HTMLInputElement | null>(null);

    const onSubmit = useCallback(
      (data: any) => {
        //

        return Promise.resolve()
          .then(() => {
            if (needConfirm) {
              return modal.confirm({
                title: "Confirm Order",
                onCancel: () => {
                  return Promise.reject("cancel");
                },
                content: (
                  <OrderConfirmView
                    order={{ ...data, side: props.side, symbol: props.symbol }}
                    symbol={symbol}
                    base={symbolConfig["base"]}
                    quote={symbolConfig.quote}
                  />
                ),
              });
            } else {
              return Promise.resolve(true);
            }
          })
          .then((isOk) => {
            return props
              .onSubmit?.({
                ...data,
                side: props.side,
                symbol: props.symbol,
              })
              .then((res) => {
                if (res.success) {
                  methods.reset({
                    order_type: data.order_type,
                    order_price: "",
                    order_quantity: "",
                    total: "",
                  });
                  // toast.success("Successfully!");
                }
                // resetForm?.();
              });
          })
          .catch((error) => {
            toast.error(error?.message || "Failed");
          });
      },
      [side, props.onSubmit, symbol, needConfirm]
    );

    useEffect(() => {
      methods.setValue("order_price", "");
      methods.setValue("order_quantity", "");
      methods.setValue("total", "");
      methods.clearErrors();
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
      methods.setValue("side", side);
      methods.clearErrors();
    }, [side]);

    // useEffect(() => {
    //   const subscription = methods.watch((value, { name, type }) => {
    //     if (type === "change") {
    //       if (name === "reduce_only") {
    //       }
    //     }
    //   });
    //   return () => subscription.unsubscribe();
    // }, []);

    const onFieldChange = (name: string, value: any) => {
      const newValues: OrderEntity = calculate(
        methods.getValues(),
        name,
        value
      );
      //

      if (name === "order_price") {
        methods.setValue("order_price", newValues.order_price as string, {
          shouldValidate: methods.formState.submitCount > 0,
        });
      }

      methods.setValue("total", newValues.total as string, {
        shouldValidate: methods.formState.submitCount > 0,
      });
      methods.setValue("order_quantity", newValues.order_quantity as string, {
        shouldValidate: methods.formState.submitCount > 0,
      });
    };

    //

    const totalAmount = useMemo(() => {
      const quantity = methods.getValues("order_quantity");
      if (
        !markPrice ||
        methods.getValues("order_type") !== OrderType.MARKET ||
        totalInputFocused.current ||
        !quantity
      ) {
        return methods.getValues("total");
      }

      return new Decimal(quantity).mul(markPrice).todp(2).toString();
    }, [
      markPrice,
      methods.getValues("order_type"),
      methods.getValues("order_quantity"),
    ]);

    useEffect(() => {
      function handleClick() {
        // 当用户点击表单区域外面的时候，取消error提示
        if (!isClickForm.current) {
          methods.clearErrors();
        }
        isClickForm.current = false;
      }

      document.body.addEventListener("click", handleClick);

      return () => {
        document.body.removeEventListener("click", handleClick);
      };
    }, []);

    // const [ratio] = useDebounce(field,200);

    return (
      // @ts-ignore
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          onClick={() => {
            isClickForm.current = true;
          }}
        >
          <div className="orderly-flex orderly-flex-col orderly-gap-3 orderly-text-3xs">
            <SegmentedButton
              buttons={[
                {
                  label: "Buy",
                  value: OrderSide.BUY,
                  disabled,
                  activeClassName:
                    "orderly-bg-trade-profit orderly-text-base-contrast after:orderly-bg-trade-profit orderly-font-bold desktop:orderly-font-bold",
                  disabledClassName:
                    "orderly-bg-base-400 orderly-text-base-contrast-20 after:orderly-bg-base-400 orderly-cursor-not-allowed orderly-font-bold desktop:orderly-font-bold",
                },
                {
                  label: "Sell",
                  value: OrderSide.SELL,
                  disabled,
                  activeClassName:
                    "orderly-bg-trade-loss orderly-text-base-contrast after:orderly-bg-trade-loss orderly-font-bold desktop:orderly-font-bold",
                  disabledClassName:
                    "orderly-bg-base-400 orderly-text-base-contrast-20 after:orderly-bg-base-400 orderly-cursor-not-allowed orderly-font-bold desktop:orderly-font-bold",
                },
              ]}
              onChange={(value) => {
                onSideChange?.(value as OrderSide);
              }}
              value={side}
            />

            <div className="orderly-flex orderly-justify-between orderly-items-center">
              <div className="orderly-flex orderly-gap-1 orderly-text-base-contrast-54 orderly-text-4xs desktop:orderly-text-3xs">
                <FreeCollat />
                <Numeral
                  rule="price"
                  className="orderly-text-base-contrast-80"
                  precision={0}
                >{`${freeCollateral ?? "--"}`}</Numeral>

                <span className="orderly-text-base-contrast-36">USDC</span>
              </div>
              <Button
                id="orderly-order-entry-deposit-button"
                variant={"text"}
                size={"small"}
                type="button"
                onClick={onDeposit}
                className="orderly-text-link orderly-text-4xs"
              >
                Deposit
              </Button>
            </div>
            {/* @ts-ignore */}
            <Controller
              name="order_type"
              control={methods.control}
              render={({ field }) => {
                return (
                  <MSelect
                    label={"Order Type"}
                    value={field.value}
                    className="orderly-bg-base-600 orderly-font-semibold"
                    color={side === OrderSide.BUY ? "buy" : "sell"}
                    fullWidth
                    options={[
                      { label: "Limit order", value: "LIMIT" },
                      {
                        label: "Market order",
                        value: "MARKET",
                      },
                    ]}
                    onChange={(value) => {
                      field.onChange(value);
                      methods.setValue("order_price", "", {
                        shouldValidate: false,
                      });

                      methods.clearErrors();
                    }}
                    // onValueChange={(value: any) => {
                    //   // setValue?.("order_type", value.value);
                    //   field.onChange(value.value);
                    //   methods.setValue("order_price", "", {
                    //     shouldValidate: true,
                    //   });
                    // }}
                  />
                );
              }}
            />
            {/* @ts-ignore */}
            <Controller
              name="order_price"
              control={methods.control}
              render={({ field }) => {
                const isMarketOrder =
                  methods.getValues("order_type") === OrderType.MARKET;

                return (
                  <Input
                    disabled={disabled}
                    ref={priceInputRef}
                    prefix="Price"
                    suffix={symbolConfig?.quote}
                    type="text"
                    inputMode="decimal"
                    error={!!methods.formState.errors?.order_price}
                    // placeholder={"Market"}
                    helpText={methods.formState.errors?.order_price?.message}
                    className="orderly-text-right orderly-font-semibold"
                    value={
                      isMarketOrder ? "Market" : commify(field.value || "")
                    }
                    containerClassName={
                      isMarketOrder
                        ? "orderly-bg-base-700"
                        : "orderly-bg-base-600"
                    }
                    readOnly={isMarketOrder}
                    onChange={(event) => {
                      // field.onChange(event.target.value);
                      onFieldChange("order_price", event.target.value);
                    }}
                    onFocus={() => (priceInputFocused.current = true)}
                    onBlur={() => (priceInputFocused.current = false)}
                  />
                );
              }}
            />
            {/* @ts-ignore */}
            <Controller
              name="order_quantity"
              control={methods.control}
              render={({ field }) => {
                return (
                  <Input
                    disabled={disabled}
                    prefix={"Quantity"}
                    type="text"
                    inputMode="decimal"
                    suffix={symbolConfig?.base}
                    className="orderly-text-right"
                    containerClassName="orderly-bg-base-600"
                    error={!!methods.formState.errors?.order_quantity}
                    helpText={methods.formState.errors?.order_quantity?.message}
                    value={commify(field.value || "")}
                    onChange={(event) => {
                      onFieldChange("order_quantity", event.target.value);
                    }}
                    onFocus={() => (quantityInputFocused.current = true)}
                    onBlur={() => (quantityInputFocused.current = false)}
                  />
                );
              }}
            />
            {/* @ts-ignore */}
            <Controller
              name="order_quantity"
              control={methods.control}
              render={({ field }) => {
                return (
                  <>
                    <Slider
                      color={side === OrderSide.BUY ? "buy" : "sell"}
                      markLabelVisible={false}
                      min={0}
                      max={maxQty === 0 ? 1 : maxQty}
                      markCount={4}
                      disabled={maxQty === 0}
                      step={symbolConfig?.["base_tick"]}
                      value={[Number(field.value ?? 0)]}
                      onValueChange={(value) => {
                        //
                        if (typeof value[0] !== "undefined") {
                          onFieldChange("order_quantity", value[0]);
                        }
                      }}
                    />
                    <div
                      className={cn(
                        "orderly-hidden desktop:orderly-flex orderly-justify-between -orderly-mt-2",
                        {
                          "orderly-text-trade-profit": side === OrderSide.BUY,
                          "orderly-text-trade-loss": side === OrderSide.SELL,
                        }
                      )}
                    >
                      <span>
                        {Number(
                          convertValueToPercentage(
                            Number(field.value),
                            0,
                            maxQty === 0 ? 1 : maxQty
                          ).toFixed()
                        )}
                        %
                      </span>
                      <span className="orderly-flex orderly-items-center orderly-gap-1">
                        <span className="orderly-text-base-contrast-54">
                          Max buy
                        </span>
                        <Numeral precision={4}>{maxQty}</Numeral>
                      </span>
                    </div>
                  </>
                );
              }}
            />
            {/* @ts-ignore */}
            <Controller
              name="total"
              control={methods.control}
              render={({ field }) => {
                return (
                  <Input
                    disabled={disabled}
                    className="orderly-text-right"
                    containerClassName="orderly-bg-base-600"
                    prefix={"Total ≈"}
                    suffix={symbolConfig?.quote}
                    type="text"
                    inputMode="decimal"
                    // value={field.value}
                    value={commify(
                      totalInputFocused.current ? field.value : totalAmount
                    )}
                    onFocus={() => (totalInputFocused.current = true)}
                    onBlur={() => (totalInputFocused.current = false)}
                    onChange={(event) => {
                      // field.onChange(event.target.value);
                      onFieldChange("total", event.target.value);
                    }}
                  />
                );
              }}
            />

            <Divider />

            <EstInfo />
            <Divider />
            <OrderOptions
              showConfirm={needConfirm}
              onConfirmChange={setNeedConfirm}
              onReduceOnlyChange={onReduceOnlyChange}
              reduceOnly={props.reduceOnly}
            />
            <StatusGuardButton>
              <Button
                id="orderly-order-entry-confirm-button"
                className="orderly-text-xs desktop:orderly-font-bold desktop:orderly-text-sm"
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
