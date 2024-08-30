import { Input } from "@/input";
import { FC, useMemo, useRef } from "react";
import { Divider } from "@/divider";
import Button from "@/button";
import { API, AlgoOrderEntity, SDKError } from "@orderly.network/types";
import { Numeral } from "@/text/numeral";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { commify, todpIfNeed } from "@orderly.network/utils";
import { Slider } from "@/slider";
import { PnlInput } from "@/block/tp_sl/pnlInput";
import { cn } from "@/utils";
import { AlgoOrderType } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types";

export interface Props {
  symbol: string;
  /**
   * Base tick size
   */
  // base_tick: number;
  onChange: (key: string, value: number | string) => void;
  maxQty: number;
  canModifyQty?: boolean;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
  className?: string;
  oldOrder?: API.AlgoOrder;
  errors: {
    [key: string]: {
      message: string;
    };
  } | null;
  order: Partial<
    AlgoOrderEntity & {
      /**
       * Computed take profit
       */
      tp_pnl: number;
      tp_offset: number;
      tp_offset_percentage: number;

      /**
       * Computed stop loss
       */
      sl_pnl: number;
      sl_offset: number;
      sl_offset_percentage: number;
    }
  >;
}

export const TPSLForm: FC<Props> = (props) => {
  if (!props.symbol) {
    throw new SDKError("Symbol is required");
  }

  if (typeof props.maxQty === "undefined") {
    throw new SDKError("Max quantity is required");
  }

  const { maxQty, order, canModifyQty = true } = props;
  const symbolInfo = useSymbolsInfo()[props.symbol];

  const maxQtyNumber = useMemo(() => {
    return Math.abs(maxQty);
  }, [maxQty]);

  const qtyRef = useRef<HTMLInputElement>(null);

  const isPositionTPSLOrder = useMemo(
    () => !!props.order.quantity && props.order.quantity === maxQtyNumber,
    [props.order.quantity, maxQtyNumber]
  );

  const dirty = useMemo(() => {
    const quantity =
      props.oldOrder?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
        ? maxQtyNumber
        : props.oldOrder?.quantity;

    let diff: number = 0;

    if (Number(order.quantity) !== quantity) {
      diff = 1;
    }

    if (props.oldOrder) {
      const tp = props.oldOrder.child_orders.find(
        (o) => o.algo_type === AlgoOrderType.TAKE_PROFIT
      );
      const sl = props.oldOrder.child_orders.find(
        (o) => o.algo_type === AlgoOrderType.STOP_LOSS
      );

      if (
        tp?.trigger_price !== Number(order.tp_trigger_price) &&
        typeof typeof order.tp_trigger_price !== "undefined"
      ) {
        // return true;
        diff = 2;
      }

      if (
        sl?.trigger_price !== Number(order.sl_trigger_price) &&
        typeof order.sl_trigger_price !== "undefined"
      ) {
        diff = 3;
      }
    }

    if (diff === 1 && !order.tp_trigger_price && !order.sl_trigger_price) {
      diff = -1;
    }

    return diff;
  }, [
    order.tp_trigger_price,
    order.sl_trigger_price,
    order.quantity,
    props.oldOrder,
  ]);

  const canSubmit = useMemo(() => {
    if (
      props.oldOrder?.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL &&
      Number(order.quantity) < maxQty &&
      !order.tp_trigger_price &&
      !order.sl_trigger_price
    ) {
      return false;
    }
    return dirty > 0 && !!order.quantity;
  }, [dirty, order.quantity, maxQty, props.oldOrder]);

  const cleanQtyInput = () => {
    props.onChange("quantity", "");
    qtyRef.current?.focus();
  };

  return (
    <div
      id="orderly-tp_sl-form"
      className={cn("orderly-space-y-4 orderly-text-3xs", props.className)}
    >
      {canModifyQty ? (
        <>
          <div>
            <div className={"orderly-flex"}>
              <Input
                error={!!props.errors?.quantity?.message}
                helpText={props.errors?.quantity?.message}
                ref={qtyRef}
                prefix="Quantity"
                fixClassName="desktop:orderly-text-2xs"
                suffix={
                  isPositionTPSLOrder && !props.isEditing ? (
                    <button
                      className="orderly-pr-2 orderly-text-base-contrast-54 orderly-h-full"
                      onClick={() => {
                        cleanQtyInput();
                      }}
                    >
                      Entire position
                    </button>
                  ) : (
                    symbolInfo("base")
                  )
                }
                value={
                  isPositionTPSLOrder && !props.isEditing
                    ? ""
                    : commify(props.order.quantity ?? 0)
                }
                className={"orderly-text-right"}
                containerClassName={
                  "desktop:orderly-bg-base-700 orderly-bg-base-500 orderly-flex-1"
                }
                name="orderQuantity"
                id="tpslOrderQuantity"
                autoComplete={"off"}
                data-testid="order-quantity"
                thousandSeparator
                // onChange={(e) => {
                //   props.onChange("quantity", e.target.value.replace(/,/g, ""));
                // }}
                onValueChange={(value) => {
                  props.onChange(
                    "quantity",
                    todpIfNeed(value, symbolInfo("base_dp"))
                  );
                }}
              />
              {!props.isEditing && (
                <button
                  onClick={() => {
                    if (isPositionTPSLOrder) {
                      // props.onChange("quantity", "");
                      // qtyRef.current?.focus();
                      cleanQtyInput();
                    } else {
                      props.onChange("quantity", maxQtyNumber);
                    }
                  }}
                  className={cn(
                    "orderly-bg-base-600 orderly-rounded orderly-px-2 orderly-text-base-contrast-54 orderly-border orderly-border-base-300 orderly-ml-2",
                    isPositionTPSLOrder &&
                      "orderly-border-primary orderly-text-primary"
                  )}
                >
                  Position
                </button>
              )}
            </div>
            <Slider
              id="orderly-tp_sl-slider"
              min={0}
              color={"primary"}
              max={maxQtyNumber}
              markCount={4}
              step={symbolInfo("base_tick")}
              value={[Number(order.quantity ?? maxQty)]}
              onValueChange={(value) => {
                if (typeof value[0] !== "undefined") {
                  props.onChange("quantity", value[0]);
                }
              }}
              className={"orderly-mt-2"}
            />
            <div
              className={
                "orderly-flex orderly-justify-between orderly-text-primary orderly-text-2xs"
              }
            >
              <span>0%</span>
              <button
                disabled={maxQtyNumber <= 0}
                onClick={() => {
                  props.onChange("quantity", maxQty);
                }}
              >
                <span>Max</span>
                <Numeral
                  className={"orderly-text-base-contrast-54 orderly-ml-1"}
                  precision={symbolInfo("base_dp")}
                >
                  {maxQty}
                </Numeral>
              </button>
            </div>
          </div>
          <Divider />
        </>
      ) : null}

      <div>
        <div
          className={
            "orderly-flex orderly-justify-between orderly-mb-[8px] orderly-items-center"
          }
        >
          <div className="orderly-text-xs">Take profit</div>
          <div
            className={"orderly-text-base-contrast-36 orderly-text-3xs"}
            data-testid="tpEstPnL"
          >
            <span>Est. PnL: </span>
            {order.tp_pnl ? (
              <Numeral rule="price" coloring precision={symbolInfo("quote_dp")}>
                {order.tp_pnl}
              </Numeral>
            ) : (
              "-"
            )}
            {/* {`est. PnL: ${order.tp_pnl ? parseNumber(order.tp_pnl) : "-"}`} */}
          </div>
        </div>
        <div className={"orderly-grid orderly-grid-cols-2 orderly-gap-2"}>
          <Input
            error={!!props.errors?.tp_trigger_price?.message}
            helpText={props.errors?.tp_trigger_price?.message}
            prefix={"TP price"}
            fixClassName="desktop:orderly-text-3xs"
            placeholder={symbolInfo("quote")}
            className={
              "orderly-text-right orderly-pr-2 orderly-text-3xs placeholder:orderly-text-3xs"
            }
            data-testid={"tp-price-input"}
            value={commify(order.tp_trigger_price ?? "")}
            thousandSeparator
            autoComplete={"off"}
            onValueChange={(value) => {
              props.onChange("tp_trigger_price", value);
            }}
            containerClassName={
              "desktop:orderly-bg-base-700 orderly-bg-base-500"
            }
          />
          <PnlInput
            quote={symbolInfo("quote")}
            quote_dp={symbolInfo("quote_dp")}
            onChange={props.onChange}
            type={"TP"}
            values={{
              PnL: `${order.tp_pnl ?? ""}`,
              Offset: `${order.tp_offset ?? ""}`,
              "Offset%": `${order.tp_offset_percentage ?? ""}`,
            }}
          />
        </div>
      </div>
      <div>
        <div
          className={
            "orderly-flex orderly-justify-between orderly-mb-[8px] orderly-items-center"
          }
        >
          <div className="orderly-text-xs">Stop loss</div>
          <div
            className={"orderly-text-base-contrast-36 orderly-text-3xs"}
            data-testid="slEstPnL"
          >
            <span>Est. PnL: </span>
            {order.sl_pnl ? (
              <Numeral rule="price" coloring precision={symbolInfo("quote_dp")}>
                {order.sl_pnl}
              </Numeral>
            ) : (
              "-"
            )}
            {/* {`${order.sl_pnl ? parseNumber(order.sl_pnl) : "-"}`} */}
          </div>
        </div>
        <div className={"orderly-grid orderly-grid-cols-2 orderly-gap-2"}>
          <Input
            error={!!props.errors?.sl_trigger_price?.message}
            helpText={props.errors?.sl_trigger_price?.message}
            prefix={"SL price"}
            fixClassName="desktop:orderly-text-3xs"
            placeholder={symbolInfo("quote")}
            className={
              "orderly-text-right orderly-pr-2 orderly-text-3xs placeholder:orderly-text-3xs"
            }
            data-testid={"sl-price-input"}
            thousandSeparator
            containerClassName={
              "desktop:orderly-bg-base-700 orderly-bg-base-500"
            }
            onValueChange={(value) => {
              props.onChange("sl_trigger_price", value);
            }}
            value={commify(order.sl_trigger_price ?? "")}
          />
          <PnlInput
            quote={symbolInfo("quote")}
            onChange={props.onChange}
            type={"SL"}
            quote_dp={symbolInfo("quote_dp")}
            values={{
              PnL: `${order.sl_pnl ?? ""}`,
              Offset: `${order.sl_offset ?? ""}`,
              "Offset%": `${order.sl_offset_percentage ?? ""}`,
            }}
          />
        </div>
      </div>
      <div
        className={
          "orderly-flex orderly-justify-center orderly-gap-3 orderly-pt-2 desktop:orderly-pt-0 orderly-text-xs"
        }
      >
        <Button
          color={"tertiary"}
          className={
            "orderly-flex-1 desktop:orderly-w-[98px] desktop:orderly-h-[32px] desktop:orderly-flex-none"
          }
          onClick={() => props.onCancel?.()}
        >
          Cancel
        </Button>
        <Button
          className={
            "orderly-flex-1 desktop:orderly-w-[98px] desktop:orderly-h-[32px] desktop:orderly-flex-none"
          }
          data-testid={"confirm"}
          onClick={props.onSubmit}
          disabled={!canSubmit}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};
