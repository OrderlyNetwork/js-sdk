import { FC, Fragment, useMemo } from "react";
import { Statistic } from "@/statistic/statistic";
import {
  API,
  AlgoOrderRootType,
  AlgoOrderType,
  OrderSide,
} from "@orderly.network/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/popover";
import { TriggerPriceItem } from "../positions/shared/triggerPrice";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { useTPSLOrderRowContext } from "../tp_sl/tpslOrderRowContext";

export const TPSLCell: FC<{
  order: API.AlgoOrderExt;
  base_dp: number;
  quote_dp: number;
}> = (props) => {
  const { order, base_dp, quote_dp } = props;
  const isAlgoOrder = order?.algo_order_id !== undefined;
  // console.log("price node", order);
  const { sl_trigger_price, tp_trigger_price, position } =
    useTPSLOrderRowContext();

  const symbolInfo = useSymbolsInfo()[order?.symbol ?? ""]();

  const childOrders = useMemo(() => {
    const orders = order.child_orders
      .filter((child) => !!child.trigger_price && child.is_activated)
      .map((child) => {
        const type =
          child.algo_type === AlgoOrderType.TAKE_PROFIT ? "TP" : "SL";
        let quantity = order.quantity;

        if (quantity === 0) {
          if (order.child_orders[0].type === "CLOSE_POSITION") {
            quantity = position?.position_qty ?? 0;
          }
        }
        return (
          <Fragment key={child.algo_order_id}>
            <div className="orderly-inline-flex">
              <Popover>
                <PopoverTrigger>
                  <Statistic
                    label={
                      <>
                        <span className="orderly-text-base-contrast-36">
                          {`${type} trigger`}
                        </span>
                        {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
                      </>
                    }
                    labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
                    valueClassName={
                      child.algo_type === AlgoOrderType.TAKE_PROFIT
                        ? "orderly-text-trade-profit orderly-text-2xs orderly-font-bold orderly-underline orderly-underline-offset-2 orderly-decoration-dashed orderly-decoration-base-contrast-36"
                        : "orderly-text-trade-loss orderly-text-2xs orderly-font-bold orderly-underline orderly-underline-offset-2 orderly-decoration-dashed orderly-decoration-base-contrast-36"
                    }
                    rule="price"
                    precision={quote_dp}
                    value={child.trigger_price}
                  />
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="orderly-p-1 orderly-bg-base-400 orderly-fill-base-400 orderly-text-3xs orderly-max-w-max"
                  arrow
                >
                  <TriggerPriceItem
                    qty={quantity}
                    price={child.trigger_price}
                    entryPrice={position?.average_open_price ?? 0}
                    orderSide={child.side as OrderSide}
                    orderType={child.algo_type as AlgoOrderType}
                    symbolInfo={symbolInfo}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Statistic
              label={`${type} price`}
              labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
              value={<span>Market</span>}
              rule="price"
              valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
            />
          </Fragment>
        );
      });

    orders.splice(
      1,
      0,
      <Statistic
        label="Quantity"
        labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
        value={
          <span>
            {order.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
              ? "Entire position"
              : order.quantity ?? "-"}
          </span>
        }
        precision={base_dp}
        rule="price"
        align="right"
        valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
      />
    );

    return orders;
  }, [order]);

  return <>{childOrders}</>;
};
