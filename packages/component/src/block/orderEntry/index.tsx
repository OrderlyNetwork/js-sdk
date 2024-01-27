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

import { Input } from "@/input";
import { Slider } from "@/slider";

import { Divider } from "@/divider";
import { OrderOptions } from "./sections/orderOptions";
import {
  useEventEmitter,
  useLocalStorage,
  useDebounce,
  useMediaQuery,
} from "@orderly.network/hooks";
import type { UseOrderEntryMetaState } from "@orderly.network/hooks";

import {
  API,
  MEDIA_TABLET,
  OrderEntity,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { modal } from "@/modal";
import { OrderConfirmView } from "./sections/orderConfirmView";
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

  submit: () => Promise<any>;
  submitting: boolean;

  markPrice?: number;
  maxQty: number;
  estLiqPrice?: number | null;
  estLeverage?: number | null;

  symbol: string;

  symbolConfig?: API.SymbolExt;

  freeCollateral?: number;

  showConfirm?: boolean;
  onConfirmChange?: (value: boolean) => void;

  // reduceOnly?: boolean;
  // onReduceOnlyChange?: (value: boolean) => void;

  // side: OrderSide;
  // onSideChange?: (value: OrderSide) => void;

  helper: {
    // clearErrors: () => void;
  };

  disabled?: boolean;

  formattedOrder: Partial<OrderEntity>;

  onFieldChange: (field: keyof OrderEntity, value: any) => void;
  setValues: (values: Partial<OrderEntity>) => void;
  metaState: UseOrderEntryMetaState;
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
      // side,
      // onSideChange,
      // onReduceOnlyChange,
      metaState,
      formattedOrder,
      helper,
      disabled,
      markPrice,
    } = props;

    const { side } = formattedOrder;

    const totalInputFocused = useRef<boolean>(false);
    const priceInputFocused = useRef<boolean>(false);
    const quantityInputFocused = useRef<boolean>(false);
    const [errorsVisible, setErrorsVisible] = useState<boolean>(false);
    const isClickForm = useRef(false);

    const isTablet = useMediaQuery(MEDIA_TABLET);

    const [needConfirm, setNeedConfirm] = useLocalStorage(
      "orderly_order_confirm",
      true
    );

    const ee = useEventEmitter();
    const isMarketOrder = formattedOrder.order_type === OrderType.MARKET;

    const orderbookItemClickHandler = useCallback((item: number[]) => {
      props.onFieldChange("order_type", OrderType.LIMIT);
      props.onFieldChange("order_price", item[0].toString());
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
      (event: FormEvent) => {
        //
        event.preventDefault();

        if (!symbolConfig) {
          return Promise.reject("symbolConfig is null");
        }

        return Promise.resolve()
          .then(() => {
            if (
              metaState.errors?.order_price?.message ||
              metaState.errors?.order_quantity?.message
            ) {
              setErrorsVisible(true);
              return Promise.reject("cancel");
            }
            if (needConfirm) {
              return modal.confirm({
                title: "Confirm Order",
                onCancel: () => {
                  return Promise.reject("cancel");
                },
                content: (
                  <OrderConfirmView
                    order={{
                      ...(formattedOrder as OrderEntity),
                      side: side!,
                      symbol: props.symbol,
                    }}
                    symbol={symbol}
                    base={symbolConfig?.base}
                    quote={symbolConfig?.quote}
                  />
                ),
              });
            } else {
              return Promise.resolve(true);
            }
          })
          .then((isOk) => {
            return props.submit().then((res) => {
              props.setValues({
                order_price: "",
                order_quantity: "",
                total: "",
              });

              // resetForm?.();
            });
          })
          .catch((error) => {
            if (error !== "cancel" && !!error?.message) {
              toast.error(error.message || "Failed");
            }
          });
      },
      [
        side,
        props.submit,
        // symbol,
        needConfirm,
        formattedOrder,
        symbolConfig?.base,
        symbolConfig?.quote,
        metaState.errors?.order_price?.message,
        metaState.errors?.order_quantity?.message,
      ]
    );

    // useEffect(() => {
    //   // methods.setValue("order_price", "");
    //   // methods.setValue("order_quantity", "");
    //   // methods.setValue("total", "");
    //   props.setValues({
    //     order_price: "",
    //     order_quantity: "",
    //     total: "",
    //   });
    //   clearErrors();
    // }, [symbol]);

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
      // methods.setValue("side", side);
      // methods.clearErrors();
    }, [side]);

    //

    const totalAmount = useMemo(() => {
      const quantity = formattedOrder.order_quantity;
      const type = formattedOrder.order_type;
      if (
        !markPrice ||
        type !== OrderType.MARKET ||
        totalInputFocused.current ||
        !quantity
      ) {
        return formattedOrder.total;
      }

      return new Decimal(quantity).mul(markPrice).todp(2).toString();
    }, [
      markPrice,
      formattedOrder.total,
      formattedOrder.order_quantity,
      formattedOrder.order_type,
    ]);

    useEffect(() => {
      function handleClick() {
        // 当用户点击表单区域外面的时候，取消error提示
        if (!isClickForm.current) {
          setErrorsVisible(false);
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

      <form
        onSubmit={onSubmit}
        onClick={() => {
          isClickForm.current = true;
        }}
        id="orderEntryForm"
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
              // onSideChange?.(value as OrderSide);
              setErrorsVisible(false);
              props.onFieldChange("side", value);
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
          <MSelect
            label={"Order Type"}
            value={formattedOrder.order_type}
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
              // field.onChange(value);
              // methods.setValue("order_price", "", {
              //   shouldValidate: false,
              // });

              // methods.clearErrors();

              props.onFieldChange("order_type", value);
            }}
          />
          <Input
            disabled={disabled}
            ref={priceInputRef}
            prefix="Price"
            suffix={symbolConfig?.quote}
            type="text"
            inputMode="decimal"
            error={!!metaState.errors?.order_price && errorsVisible}
            // placeholder={"Market"}
            helpText={metaState.errors?.order_price?.message}
            className="orderly-text-right orderly-font-semibold"
            value={
              isMarketOrder
                ? "Market"
                : commify(formattedOrder.order_price || "")
            }
            containerClassName={
              isMarketOrder ? "orderly-bg-base-700" : "orderly-bg-base-600"
            }
            readOnly={isMarketOrder}
            onChange={(event) => {
              // field.onChange(event.target.value);
              props.onFieldChange("order_price", event.target.value);
            }}
            onFocus={() => (priceInputFocused.current = true)}
            onBlur={() => (priceInputFocused.current = false)}
          />
          {/* @ts-ignore */}
          <Input
            disabled={disabled}
            prefix={"Quantity"}
            type="text"
            inputMode="decimal"
            suffix={symbolConfig?.base}
            className="orderly-text-right"
            containerClassName="orderly-bg-base-600"
            error={!!metaState.errors?.order_quantity && errorsVisible}
            helpText={metaState.errors?.order_quantity?.message}
            value={commify(formattedOrder.order_quantity || "")}
            onChange={(event) => {
              props.onFieldChange("order_quantity", event.target.value);
            }}
            onFocus={() => (quantityInputFocused.current = true)}
            onBlur={() => (quantityInputFocused.current = false)}
          />

          <Slider
            color={side === OrderSide.BUY ? "buy" : "sell"}
            markLabelVisible={false}
            min={0}
            max={maxQty === 0 ? 1 : maxQty}
            markCount={4}
            disabled={maxQty === 0}
            step={symbolConfig?.["base_tick"]}
            value={[Number(formattedOrder.order_quantity ?? 0)]}
            onValueChange={(value) => {
              //
              if (typeof value[0] !== "undefined") {
                props.onFieldChange("order_quantity", value[0]);
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
                  Number(formattedOrder.order_quantity ?? 0),
                  0,
                  maxQty === 0 ? 1 : maxQty
                ).toFixed()
              )}
              %
            </span>
            <span className="orderly-flex orderly-items-center orderly-gap-1 orderly-tabular-nums">
              <span className="orderly-text-base-contrast-54">Max buy</span>
              <Numeral precision={4}>{maxQty}</Numeral>
            </span>
          </div>

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
              totalInputFocused.current ? formattedOrder.total! : totalAmount!
            )}
            onFocus={() => (totalInputFocused.current = true)}
            onBlur={() => (totalInputFocused.current = false)}
            onChange={(event) => {
              // field.onChange(event.target.value);
              props.onFieldChange("total", event.target.value);
            }}
          />

          {!isTablet && (
            <>
              <Divider />
              <EstInfo
                estLiqPrice={props.estLiqPrice}
                estLeverage={props.estLeverage}
              />
            </>
          )}

          <Divider />
          <OrderOptions
            formattedOrder={formattedOrder}
            showConfirm={needConfirm}
            onConfirmChange={setNeedConfirm}
            onReduceOnlyChange={(value) =>
              props.onFieldChange("reduce_only", value)
            }
            reduceOnly={formattedOrder.reduce_only}
            onFieldChange={props.onFieldChange}
          />
          <StatusGuardButton>
            <Button
              id="orderly-order-entry-confirm-button"
              className="orderly-text-xs desktop:orderly-font-bold desktop:orderly-text-sm"
              type="submit"
              loading={props.submitting}
              color={side === OrderSide.BUY ? "buy" : "sell"}
              fullWidth
            >
              {buttonText}
            </Button>
          </StatusGuardButton>
        </div>
      </form>
    );
  }
);
