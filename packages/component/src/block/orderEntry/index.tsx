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
  FocusEvent,
} from "react";
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
  useDebouncedCallback,
} from "@orderly.network/hooks";
import { UseOrderEntryMetaState, utils } from "@orderly.network/hooks";
import { AuthGuard } from "@orderly.network/ui-connector";

import {
  API,
  MEDIA_TABLET,
  OrderEntity,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
// import { modal } from "@orderly.network/ui";
import { modal } from "@orderly.network/ui";
import {
  OrderConfirmCheckBox,
  OrderConfirmFooter,
  OrderConfirmView,
} from "./sections/orderConfirmView.new";
import { toast } from "@/toast";
import { Decimal, commify, removeTrailingZeros } from "@orderly.network/utils";
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

enum InputType {
  PRICE, // price input focus
  TRIGGER_PRICE, // trigger price input focus
  QUANTITY, // quantity input focus
  TOTAL, // total input focus
  NONE,
}

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

    const { side, isStopOrder } = formattedOrder;

    // const totalInputFocused = useRef<boolean>(false);
    // const priceInputFocused = useRef<boolean>(false);
    const quantityInputFocused = useRef<boolean>(false);
    const [errorsVisible, setErrorsVisible] = useState<boolean>(false);
    const isClickForm = useRef(false);
    const currentFocusInput = useRef<InputType>(InputType.NONE);

    const priceInputRef = useRef<HTMLInputElement | null>(null);
    const triggerPriceInputRef = useRef<HTMLInputElement | null>(null);

    const isTablet = useMediaQuery(MEDIA_TABLET);

    const [needConfirm, setNeedConfirm] = useLocalStorage(
      "orderly_order_confirm",
      true
    );

    const baseDP = symbolConfig?.base_dp;

    const ee = useEventEmitter();
    const isMarketOrder = [OrderType.MARKET, OrderType.STOP_MARKET].includes(
      formattedOrder.order_type || OrderType.LIMIT
    );

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      // handle orderbook item click event
      const orderbookItemClickHandler = (item: number[]) => {
        if (currentFocusInput.current === InputType.TRIGGER_PRICE) {
          if (
            formattedOrder.order_type === OrderType.STOP_LIMIT ||
            formattedOrder.order_type === OrderType.STOP_MARKET
          ) {
            props.onFieldChange("trigger_price", removeTrailingZeros(item[0]));
            focusInputElement(triggerPriceInputRef.current);
          }
        } else {
          if (
            formattedOrder.order_type === OrderType.STOP_LIMIT ||
            formattedOrder.order_type === OrderType.LIMIT
          ) {
            props.onFieldChange("order_price", removeTrailingZeros(item[0]));
            focusInputElement(priceInputRef.current);
          } else {
            // other order type
            let newType;

            if (formattedOrder.order_type === OrderType.STOP_MARKET) {
              newType = OrderType.STOP_LIMIT;
            } else if (formattedOrder.order_type === OrderType.MARKET) {
              newType = OrderType.LIMIT;
            }

            if (typeof newType !== "undefined") {
              props.onFieldChange("order_type", newType);
            }
            props.onFieldChange("order_price", removeTrailingZeros(item[0]));
            focusInputElement(priceInputRef.current);
          }
        }

        // if (formattedOrder.order_type === OrderType.STOP_LIMIT) {
        //   if (currentFocusInput.current === InputType.TRIGGER_PRICE) {
        //     // newType = OrderType.LIMIT;
        //     props.onFieldChange("trigger_price", item[0].toString());
        //     focusInputElement(triggerPriceInputRef.current);
        //   } else {
        //     props.onFieldChange("order_price", item[0].toString());
        //     focusInputElement(priceInputRef.current);
        //   }
        // } else {
        //   let newType;

        //   // if (formattedOrder.order_type === OrderType.STOP_MARKET) {
        //   //   newType = OrderType.STOP_LIMIT;
        //   // } else if (formattedOrder.order_type === OrderType.MARKET) {
        //   //   newType = OrderType.LIMIT;
        //   // }

        //   if (typeof newType !== "undefined") {
        //     props.onFieldChange("order_type", newType);
        //   }
        //   props.onFieldChange("order_price", item[0].toString());
        //   focusInputElement(priceInputRef.current);
        // }

        function focusInputElement(target: HTMLInputElement | null) {
          setTimeout(() => {
            target?.focus();
          }, 0);
        }
      };

      ee.on("orderbook:item:click", orderbookItemClickHandler);

      return () => {
        ee.off("orderbook:item:click", orderbookItemClickHandler);
      };
    }, [formattedOrder.order_type]);

    const [buttonText, setButtonText] = useState<string>("Buy / Long");

    // const isTable = useMediaQuery(MEDIA_TABLET);

    const formatQty = () => {
      // const dp = new Decimal(symbolConfig?.base_tick || "0").toNumber();
      // TODO: optimization
      // if (dp < 1) return;
      const quantity = utils.formatNumber(
        formattedOrder?.order_quantity,
        new Decimal(symbolConfig?.base_tick || "0").toNumber()
      );
      props.onFieldChange("order_quantity", quantity);
    };

    const onFocus = (type: InputType) => (_: FocusEvent<HTMLInputElement>) => {
      currentFocusInput.current = type;
    };

    const onBlur = (type: InputType) => (_: FocusEvent) => {
      setTimeout(() => {
        if (currentFocusInput.current !== type) return;
        currentFocusInput.current = InputType.NONE;
      }, 300);

      if (type === InputType.QUANTITY || type === InputType.TOTAL) {
        formatQty();
      }
    };

    const onSubmit = (event: FormEvent) => {
      //
      event.preventDefault();

      if (submitting) return;
      setSubmitting(true);
      if (!symbolConfig) {
        return Promise.reject("symbolConfig is null");
      }

      return Promise.resolve()
        .then(() => {
          if (
            metaState.errors?.order_price?.message ||
            metaState.errors?.order_quantity?.message ||
            metaState.errors?.trigger_price?.message ||
            metaState.errors?.total?.message
          ) {
            setErrorsVisible(true);
            return Promise.reject("cancel");
          }
          formatQty();
          if (needConfirm) {
            return modal.confirm({
              // maxWidth: "sm",
              title: "Confirm Order",
              bodyClassName: "!orderly-pb-0",
              // okId: "orderly-confirm-order-dialog-confirm",
              // cancelId: "orderly-confirm-order-dialog-cancel",
              onCancel: () => {
                return Promise.reject("cancel");
              },
              footer: !isTablet ? (
                <OrderConfirmFooter
                  onCancel={() => {
                    return Promise.reject("cancel");
                  }}
                  // onOk={() => {
                  //   return Promise.resolve(true);
                  // }}
                />
              ) : undefined,
              content: (
                <>
                  <OrderConfirmView
                    order={{
                      ...(formattedOrder as OrderEntity),
                      side: side!,
                      symbol: props.symbol,
                    }}
                    symbol={symbol}
                    base={symbolConfig?.base}
                    quote={symbolConfig?.quote}
                    isTable={isTablet}
                  />
                  {!isTablet ? (
                    <div className="orderly-flex-1 orderly-items-center orderly-h-[32px]">
                      <OrderConfirmCheckBox className="orderly-pt-[6px]" />
                    </div>
                  ) : null}
                </>
              ),
            });
          } else {
            return Promise.resolve(true);
          }
        })
        .then((isOk) => {
          return props.submit().then(
            (res) => {
              props.setValues({
                // trigger_price: "",
                // order_price: "",
                order_quantity: "",
                // total: "",
              });
              // resetForm?.();
            },
            (err) => {
              if (typeof err === "string") {
                toast.error(err);
              } else if (err.name === "ApiError") {
                toast.error(err.message);
              } else {
                console.log("Create order failed:", err);
                toast.error(err?.message);
              }
            }
          );
        })
        .catch((error) => {
          if (error !== "cancel" && !!error?.message) {
            toast.error(error.message || "Failed");
          }
        }).finally(() => {
          setSubmitting(false);
        });
    };
    
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
        (type !== OrderType.MARKET && type !== OrderType.STOP_MARKET) ||
        currentFocusInput.current === InputType.TOTAL ||
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
        // When the user clicks outside the form area, hide the error message
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

    return (
      // @ts-ignore

      <form
        onSubmit={onSubmit}
        onClick={() => {
          isClickForm.current = true;
        }}
        id="orderly-order-entry-form"
      >
        <div className="orderly-flex orderly-flex-col orderly-gap-3 orderly-text-3xs">
          <SegmentedButton
            id="orderly-order-entry-trade-type"
            buttons={[
              {
                id: "orderly-order-entry-buy-button",
                label: "Buy",
                value: OrderSide.BUY,
                disabled,
                activeClassName:
                  "orderly-bg-trade-profit orderly-text-base-contrast after:orderly-bg-trade-profit orderly-font-bold desktop:orderly-font-bold",
                disabledClassName:
                  "orderly-bg-base-400 orderly-text-base-contrast-20 after:orderly-bg-base-400 orderly-cursor-not-allowed orderly-font-bold desktop:orderly-font-bold",
              },
              {
                id: "orderly-order-entry-sell-button",
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
              {!isTablet && (
                <span className="orderly-text-base-contrast-36">USDC</span>
              )}
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
            id="orderly-order-entry-order-type"
            label={"Order Type"}
            value={formattedOrder.order_type}
            className="orderly-bg-base-600 orderly-font-semibold"
            color={side === OrderSide.BUY ? "buy" : "sell"}
            fullWidth
            options={[
              {
                label: "Limit order",
                value: "LIMIT",
                id: "orderly-order-entry-order-type-limit",
              },
              {
                label: "Market order",
                value: "MARKET",
                id: "orderly-order-entry-order-type-market",
              },
              {
                label: "Stop limit",
                value: "STOP_LIMIT",
                id: "orderly-order-entry-order-type-stop-limit",
              },
              {
                label: "Stop market",
                value: "STOP_MARKET",
                id: "orderly-order-entry-order-type-stop-market",
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
          {isStopOrder && (
            <Input
              disabled={disabled}
              ref={triggerPriceInputRef}
              prefix="Trigger"
              suffix={symbolConfig?.quote}
              type="text"
              inputMode="decimal"
              id="order_trigger_price_input"
              name="order_trigger_price_input"
              autoComplete="off"
              error={!!metaState.errors?.trigger_price && errorsVisible}
              helpText={metaState.errors?.trigger_price?.message}
              className="orderly-text-right orderly-font-semibold"
              value={commify(formattedOrder.trigger_price || "")}
              containerClassName={"orderly-bg-base-600"}
              onChange={(event) => {
                // field.onChange(event.target.value);
                props.onFieldChange("trigger_price", event.target.value);
              }}
              onFocus={onFocus(InputType.TRIGGER_PRICE)}
              onBlur={onBlur(InputType.TRIGGER_PRICE)}
            />
          )}
          <Input
            disabled={disabled}
            ref={priceInputRef}
            prefix="Price"
            suffix={symbolConfig?.quote}
            type="text"
            inputMode="decimal"
            id="order_price_input"
            name="order_price_input"
            error={!!metaState.errors?.order_price && errorsVisible}
            helpText={metaState.errors?.order_price?.message}
            className="orderly-text-right orderly-font-semibold"
            autoComplete="off"
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
            onFocus={onFocus(InputType.PRICE)}
            onBlur={onBlur(InputType.PRICE)}
          />
          {/* @ts-ignore */}
          <Input
            disabled={disabled}
            prefix={"Quantity"}
            type="text"
            inputMode="decimal"
            suffix={symbolConfig?.base}
            id="order_quantity_input"
            name="order_quantity_input"
            className="orderly-text-right"
            containerClassName="orderly-bg-base-600"
            error={!!metaState.errors?.order_quantity && errorsVisible}
            helpText={metaState.errors?.order_quantity?.message}
            autoComplete="off"
            value={commify(formattedOrder.order_quantity || "")}
            onChange={(event) => {
              props.onFieldChange("order_quantity", event.target.value);
            }}
            onFocus={onFocus(InputType.QUANTITY)}
            onBlur={onBlur(InputType.QUANTITY)}
          />

          <Slider
            id="orderly-order-entry-slider"
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
              "orderly-hidden desktop:!orderly-flex orderly-justify-between -orderly-mt-2",
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
                  maxQty
                ).toFixed()
              )}
              %
            </span>
            <button
              id="orderly-order-entry-max-buy-or-sell"
              type="button"
              className="orderly-flex orderly-items-center orderly-gap-1 orderly-tabular-nums"
              onClick={() => {
                props.onFieldChange("order_quantity", maxQty);
              }}
            >
              <span
                id="orderly-order-entry-max-buy-or-sell-text"
                className="orderly-text-base-contrast-54"
              >
                {formattedOrder.side === OrderSide.BUY ? "Max buy" : "Max sell"}
              </span>
              <Numeral precision={baseDP}>{maxQty}</Numeral>
            </button>
          </div>

          <Input
            disabled={disabled}
            className="orderly-text-right"
            containerClassName="orderly-bg-base-600"
            prefix={"Total ≈"}
            suffix={symbolConfig?.quote}
            type="text"
            inputMode="decimal"
            id="order_total_input"
            name="order_total_input"
            autoComplete="off"
            autoFocus={false}
            error={!!metaState.errors?.total && errorsVisible}
            helpText={metaState.errors?.total?.message}
            value={commify(
              currentFocusInput.current === InputType.TOTAL
                ? formattedOrder.total!
                : totalAmount!
            )}
            onFocus={onFocus(InputType.TOTAL)}
            onBlur={onBlur(InputType.TOTAL)}
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
                precision={symbolConfig?.quote_dp}
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
          <AuthGuard
            // @ts-ignore
            id="orderly-order-entry-status-guard-button"
            buttonProps={{ size: "lg", fullWidth: true }}
          >
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
          </AuthGuard>
        </div>
      </form>
    );
  }
);

OrderEntry.displayName = "OrderEntry";
