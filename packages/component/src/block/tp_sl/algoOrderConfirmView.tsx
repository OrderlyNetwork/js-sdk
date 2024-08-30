import { NetworkImage } from "@/icon/networkImage";
import { Numeral } from "@/text";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { AlgoOrderEntity, AlgoOrderRootType } from "@orderly.network/types";
import { commify } from "@orderly.network/utils";
import { FC, useMemo, useState } from "react";
import { OrderConfirmCheckBox } from "../orderEntry/sections/orderConfirmView.new";
import { API } from "@orderly.network/types";
import { Button } from "@/button/button";
import { cn } from "@/utils";

export const AlgoOrderConfirmView: FC<{
  order: AlgoOrderEntity;
  tp_trigger_price?: number | string;
  sl_trigger_price?: number | string;
  onCancel: () => void;
  onConfirm: () => Promise<any>;
  oldOrder?: API.AlgoOrder;
  isEditing?: boolean;
  quoteDp?: number;
}> = (props) => {
  const { order, oldOrder, tp_trigger_price, sl_trigger_price } = props;

  const symbolConfig = useSymbolsInfo()[order.symbol]();
  const [loading, setLoading] = useState(false);

  const type = useMemo(() => {
    if (order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
      if (
        typeof tp_trigger_price !== "undefined" &&
        typeof sl_trigger_price !== "undefined"
      ) {
        return "Position TP/SL";
      }

      if (typeof tp_trigger_price !== "undefined") {
        return "Position TP";
      }

      if (typeof sl_trigger_price !== "undefined") {
        return "Position SL";
      }
    }

    if (order.algo_type === AlgoOrderRootType.TP_SL) {
      if (
        typeof tp_trigger_price !== "undefined" &&
        typeof sl_trigger_price !== "undefined"
      ) {
        return "TP/SL";
      }

      if (typeof tp_trigger_price !== "undefined") {
        return "Take profit";
      }

      if (typeof sl_trigger_price !== "undefined") {
        return "Stop loss";
      }
    }
  }, [order]);

  const qty = useMemo(() => {
    if (order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
      return "Entire position";
    }
    return commify(order.quantity);
  }, [order]);

  return (
    <div className="orderly-px-5 orderly-mt-5">
      {props.isEditing && (
        <div className="orderly-pb-3 orderly-text-sm orderly-text-base-contrast-80">{`You agree to edit your ${symbolConfig.base}-PERP order.`}</div>
      )}
      <div className="orderly-flex orderly-items-center orderly-pb-4">
        <NetworkImage symbol={order.symbol} type="symbol" size={20} />
        <span className="orderly-text-lg orderly-pl-2">{`${symbolConfig.base}-PERP`}</span>
      </div>
      <div
        className={cn(
          "orderly-text-base-contract-54 orderly-text-xs desktop:orderly-text-sm orderly-font-semibold orderly-flex orderly-gap-2"
        )}
      >
        {!props.isEditing && (
          <div className={" orderly-w-[78px] desktop:orderly-flex-1"}>
            <div className="orderly-mr-3">{type}</div>
          </div>
        )}
        <div className="orderly-flex-1 orderly-gap-2 orderly-text-xs desktop:orderly-text-sm">
          <div className="orderly-flex orderly-justify-between orderly-mb-1">
            <span className="orderly-text-base-contrast-54">Qty.</span>
            <span>{qty}</span>
          </div>
          {!!tp_trigger_price && (
            <div className="orderly-flex orderly-justify-between orderly-mb-1">
              <span className="orderly-text-base-contrast-54">TP Price</span>
              <Numeral
                children={tp_trigger_price}
                precision={props.quoteDp}
                rule="price"
                coloring
                surfix={
                  <span className="orderly-text-base-contrast-36">
                    {symbolConfig.quote}
                  </span>
                }
              />
            </div>
          )}
          {!!sl_trigger_price && (
            <div className="orderly-flex orderly-justify-between orderly-mb-1">
              <span className="orderly-text-base-contrast-54">SL Price</span>
              <Numeral
                children={sl_trigger_price}
                precision={props.quoteDp}
                rule="price"
                className="orderly-text-trade-loss"
                surfix={
                  <span className="orderly-text-base-contrast-36">
                    {symbolConfig.quote}
                  </span>
                }
              />
            </div>
          )}

          <div className="orderly-flex orderly-justify-between orderly-mb-1">
            <span className="orderly-text-base-contrast-54">Price</span>
            <span>Market</span>
          </div>
        </div>
      </div>

      {/* {!props.isEditing ? (
        <div className="orderly-flex orderly-gap-2 orderly-my-5">
          <OrderConfirmCheckBox />
        </div>
      ) : (
        <div className="orderly-h-[20px]"></div>
      )} */}

      <div
        className={cn(
          "orderly-grid orderly-grid-cols-1 desktop:orderly-mt-6 desktop:orderly-grid-cols-2",
          props.isEditing && "desktop:orderly-grid-cols-1 orderly-mt-3"
        )}
      >
        {!props.isEditing ? (
          <div className="orderly-flex orderly-items-center orderly-h-[40px]">
            <OrderConfirmCheckBox />
          </div>
        ) : null}

        <div className="orderly-grid orderly-grid-cols-2 orderly-gap-2">
          <Button
            className="orderly-confirm-dialog-cancal-button orderly-text-xs desktop:orderly-text-xs orderly-font-bold"
            key="cancel"
            type="button"
            variant="contained"
            color="tertiary"
            onClick={props.onCancel}
            disabled={loading}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            className="orderly-confirm-dialog-ok-button orderly-text-xs desktop:orderly-text-xs orderly-font-bold"
            key="ok"
            type="button"
            disabled={loading}
            loading={loading}
            fullWidth
            onClick={() => {
              setLoading(true);
              props.onConfirm?.().finally(() => setLoading(false));
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};
