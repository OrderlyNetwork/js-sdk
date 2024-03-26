import { NetworkImage } from "@/icon/networkImage";
import { Numeral } from "@/text";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { AlgoOrderEntity, AlgoOrderRootType } from "@orderly.network/types";
import { commify } from "@orderly.network/utils";
import { FC, useMemo, useState } from "react";
import { OrderConfirmCheckBox } from "../orderEntry/sections/orderConfirmView.new";
import { API } from "@orderly.network/types";

export const AlgoOrderConfirmView: FC<{
  order: AlgoOrderEntity;
  tp_trigger_price?: number | string;
  sl_trigger_price?: number | string;
  // onCancel: () => void;
  // onConfirm: () => Promise<any>;
  oldOrder?: API.AlgoOrder;
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
      <div className="orderly-flex orderly-items-center orderly-pb-4">
        <NetworkImage symbol={order.symbol} type="symbol" size={20} />
        <span className="orderly-text-lg orderly-pl-2">{`${symbolConfig.base}-PERP`}</span>
      </div>
      <div className="orderly-flex orderly-text-base-contract-54 orderly-text-xs desktop:orderly-text-sm orderly-font-semibold">
        <div>
          <div className="orderly-mr-3 orderly-w-[89px]">{type}</div>
        </div>
        <div className="orderly-flex-1 orderly-gap-2">
          <div className="orderly-flex orderly-justify-between orderly-mb-1">
            <span className="orderly-text-base-contrast-54">Qty.</span>
            <span>{qty}</span>
          </div>
          {!!tp_trigger_price && (
            <div className="orderly-flex orderly-justify-between orderly-mb-1">
              <span className="orderly-text-base-contrast-54">TP Price</span>
              <Numeral
                children={tp_trigger_price}
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
      <div className="orderly-flex orderly-gap-2 orderly-my-5">
        <OrderConfirmCheckBox />
      </div>
    </div>
  );
};
