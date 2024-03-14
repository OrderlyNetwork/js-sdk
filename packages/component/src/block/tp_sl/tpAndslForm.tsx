import { Input } from "@/input";
import { FC, useMemo } from "react";
import { Divider } from "@/divider";
import Button from "@/button";
import { API, AlgoOrderEntry, SDKError } from "@orderly.network/types";
import { Numeral } from "@/text/numeral";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { commify } from "@orderly.network/utils";
import { Slider } from "@/slider";
import { PnlInput } from "@/block/tp_sl/pnlInput";

export interface Props {
  symbol: string;
  onChange: (key: string, value: number | string) => void;
  maxQty: number;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
  order: Partial<
    AlgoOrderEntry & {
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

export const TPForm: FC<Props> = (props) => {
  if (!props.symbol) {
    throw new SDKError("Symbol is required");
  }

  if (!props.maxQty) {
    throw new SDKError("Max quantity is required");
  }

  if (!props.order) {
    throw new SDKError("Order is required");
  }

  const { maxQty, order } = props;
  const symbolInfo = useSymbolsInfo()[props.symbol];

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
          data-testid="order-quantity"
          onChange={(e) => {
            props.onChange("quantity", e.target.value);
          }}
        />
        <Slider
          min={0}
          max={maxQty}
          color={"primary"}
          value={[100]}
          markCount={4}
          className={"orderly-mt-2"}
        />
        <div
          className={
            "orderly-flex orderly-justify-between orderly-text-primary orderly-text-xs"
          }
        >
          <span>0%</span>
          <div>
            <span>Max</span>
            <Numeral
              className={"orderly-text-base-contrast-54 orderly-ml-1"}
              precision={symbolInfo("base_dp")}
            >
              {maxQty}
            </Numeral>
          </div>
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
            onChange={(e) => {
              props.onChange("tp_trigger_price", e.target.value);
            }}
          />
          <PnlInput
            quote={symbolInfo("quote")}
            onChange={props.onChange}
            type={"TP"}
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
          />
          <PnlInput
            quote={symbolInfo("quote")}
            onChange={props.onChange}
            type={"SL"}
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
