import { Input } from "@/input";
import { FC, useMemo } from "react";
import { Divider } from "@/divider";
import Button from "@/button";
import { AlgoOrderEntity, SDKError } from "@orderly.network/types";
import { Numeral } from "@/text/numeral";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { commify } from "@orderly.network/utils";
import { Slider } from "@/slider";
import { PnlInput } from "@/block/tp_sl/pnlInput";
import { UpdateOrderKey } from "@orderly.network/hooks/esm/orderly/useTakeProfitAndStopLoss/utils";

export interface Props {
  symbol: string;
  /**
   * Base tick size
   */
  // base_tick: number;
  onChange: (key: UpdateOrderKey, value: number | string) => void;
  maxQty: number;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
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

  if (!props.maxQty) {
    throw new SDKError("Max quantity is required");
  }

  // if (!props.order) {
  //   throw new SDKError("Order is required");
  // }

  const { maxQty, order } = props;
  const symbolInfo = useSymbolsInfo()[props.symbol];

  const maxQtyNumber = useMemo(() => {
    return Math.abs(maxQty);
  }, [maxQty]);

  return (
    <div className={"orderly-space-y-4"}>
      <div>
        <Input
          prefix="Quantity"
          suffix={symbolInfo("base")}
          value={commify(props.order.quantity ?? 0)}
          className={"orderly-text-right"}
          name="orderQuantity"
          id="orderQuantity"
          autoComplete={"off"}
          data-testid="order-quantity"
          onChange={(e) => {
            props.onChange("quantity", e.target.value);
          }}
        />
        <Slider
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
            "orderly-flex orderly-justify-between orderly-text-primary orderly-text-xs"
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

      <div>
        <div
          className={
            "orderly-flex orderly-justify-between orderly-mb-[8px] orderly-items-center"
          }
        >
          <div>Take profit</div>
          <div
            className={"orderly-text-base-contrast-36 orderly-text-xs"}
            data-testid="tpEstPnL"
          >
            {`est. PNL: ${order.tp_pnl ?? "-"}`}
          </div>
        </div>
        <div className={"orderly-grid orderly-grid-cols-2 orderly-gap-2"}>
          <Input
            prefix={"TP price"}
            placeholder={symbolInfo("quote")}
            className={"orderly-text-right orderly-pr-2"}
            data-testid={"tp-price-input"}
            value={commify(order.tp_trigger_price ?? "")}
            thousandSeparator
            autoComplete={"off"}
            onValueChange={(value) => {
              props.onChange("tp_trigger_price", value);
            }}
          />
          <PnlInput
            quote={symbolInfo("quote")}
            onChange={props.onChange}
            type={"TP"}
            values={{
              PNL: `${order.tp_pnl ?? ""}`,
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
          <div>Stop loss</div>
          <div
            className={"orderly-text-base-contrast-36 orderly-text-xs"}
            data-testid="slEstPnL"
          >
            {`est. PNL: ${order.sl_pnl ?? "-"}`}
          </div>
        </div>
        <div className={"orderly-grid orderly-grid-cols-2 orderly-gap-2"}>
          <Input
            prefix={"SL price"}
            placeholder={symbolInfo("quote")}
            className={"orderly-text-right orderly-pr-2"}
            data-testid={"sl-price-input"}
            thousandSeparator
            onValueChange={(value) => {
              props.onChange("sl_trigger_price", value);
            }}
            value={commify(order.sl_trigger_price ?? "")}
          />
          <PnlInput
            quote={symbolInfo("quote")}
            onChange={props.onChange}
            type={"SL"}
            values={{
              PNL: `${order.sl_pnl ?? ""}`,
              Offset: `${order.sl_offset ?? ""}`,
              "Offset%": `${order.sl_offset_percentage ?? ""}`,
            }}
          />
        </div>
      </div>
      <div className={"orderly-flex orderly-justify-center orderly-gap-3"}>
        <Button
          color={"tertiary"}
          className={"orderly-min-w-[98px]"}
          onClick={() => props.onCancel?.()}
        >
          Cancel
        </Button>
        <Button
          className={"orderly-min-w-[98px]"}
          data-testid={"confirm"}
          onClick={props.onSubmit}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};
