import { SymbolContext } from "@/provider";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { Text } from "@/text";
import { firstLetterToUpperCase, upperCaseFirstLetter } from "@/utils/string";
import { API, AlgoOrderRootType } from "@orderly.network/types";
import { OrderSide, OrderType } from "@orderly.network/types";
import { FC, useContext, useMemo } from "react";
import { OrderTypeTag } from "./typeTag";

interface HistoryCellProps {
  item: any;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const Cell: FC<HistoryCellProps> = (props) => {
  const { item } = props;
  const { quote, quote_dp, base, base_dp } = useContext(SymbolContext);

  const typeTag = useMemo(() => {
    if (item.side === OrderSide.SELL) {
      return (
        <Tag color="sell" size="small">
          Sell
        </Tag>
      );
    }

    return (
      <Tag color="buy" size="small">
        Buy
      </Tag>
    );
  }, [item]);

  const onSymbol = () => {
    props.onSymbolChange?.({ symbol: item.symbol } as API.Symbol);
    // go to the top of page
    window.scrollTo(0, 0);
  };

  const state = useMemo(() => {
    const status = item.status || item.algo_status;

    if (status === "NEW") {
      return upperCaseFirstLetter("pending");
    }
    return upperCaseFirstLetter(status);
  }, [item.status, item.algo_status]);

  const qty = useMemo(() => {
    if (item.parent_algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
      return <span>Entire position</span>;
    }
    return item.quantity ?? "-";
  }, [item]);

  return (
    <div className="orderly-px-4 orderly-py-2">
      <div className="orderly-mb-1 orderly-flex orderly-items-start orderly-justify-between">
        <div className="orderly-flex-col">
          <div className="orderly-flex orderly-items-center orderly-gap-2 ">
            {typeTag}
            <div className="orderly-flex-1 orderly-text-2xs" onClick={onSymbol}>
              <Text rule="symbol">{item.symbol}</Text>
            </div>
          </div>
          <OrderTypeTag order={item} />
        </div>
        <div className="orderly-text-3xs orderly-text-base-contrast-36 orderly-flex orderly-flex-col orderly-gap-1">
          <div className="orderly-text-2xs orderly-text-base-contrast-80 orderly-text-right">
            {state}
          </div>
          <Text rule="date">{item.created_time}</Text>
        </div>
      </div>
      <div className="orderly-grid orderly-grid-cols-3 orderly-gap-2">
        <Statistic
          label="Qty."
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs"
          value={qty}
          rule="price"
          precision={base_dp}
          className={
            item.parent_algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
              ? ""
              : item.side === OrderSide.BUY
              ? "orderly-text-trade-profit"
              : "orderly-text-trade-loss"
          }
        />
        <Statistic
          label="Filled"
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
          // @ts-ignore
          value={item.total_executed_quantity ?? "-"}
          rule="price"
          precision={base_dp}
        />
        <Statistic
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
          rule="price"
          precision={quote_dp}
          label={
            <>
              <span className="orderly-text-base-contrast-36">
                Trigger price
              </span>
              {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
            </>
          }
          value={
            item.type === OrderType.MARKET ||
            item.type === OrderType.STOP_MARKET
              ? "Market"
              : item.trigger_price
          }
          align="right"
        />
        <Statistic
          label={
            <>
              <span className="orderly-text-base-contrast-36">Avg. price</span>
              {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
            </>
          }
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
          rule="price"
          precision={quote_dp}
          value={item.average_executed_price ?? "-"}
        />
        <Statistic
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs orderly-text-base-contrast-80"
          rule="price"
          precision={quote_dp}
          label={
            <>
              <span className="orderly-text-base-contrast-36">Order price</span>
              {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
            </>
          }
          value={item.type === OrderType.MARKET ? "Market" : item.price}
        />
        <Statistic
          labelClassName="orderly-text-3xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-2xs"
          rule="price"
          precision={2}
          prefix={item.realized_pnl > 0 ? "+" : ""}
          label={
            <>
              <span className="orderly-text-base-contrast-36">
                Real. PnL(USDC)
              </span>
              {/* <span className="orderly-text-base-contrast-20">(USDC)</span> */}
            </>
          }
          className={
            item.realized_pnl === 0
              ? ""
              : item.realized_pnl > 0
              ? "orderly-text-trade-profit"
              : "orderly-text-trade-loss"
          }
          value={item.realized_pnl === 0 ? "-" : item.realized_pnl}
          align="right"
        />
      </div>
    </div>
  );
};
