import { SymbolContext } from "@/provider";
import { Statistic } from "@/statistic";
import { Tag } from "@/tag";
import { Text } from "@/text";
import { firstLetterToUpperCase } from "@/utils/string";
import { API } from "@orderly.network/types";
import { OrderSide, OrderType } from "@orderly.network/types";
import { FC, useContext, useMemo } from "react";

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

  return (
    <div className="orderly-p-4">
      <div className="orderly-flex orderly-justify-between orderly-items-center">
        <div className="orderly-flex-1 orderly-flex orderly-items-center">
          {typeTag}
          <div className="orderly-px-2 orderly- orderly-text-2xs" onClick={onSymbol}>
            <Text rule="symbol">{item.symbol}</Text>
          </div>
        </div>
        <div className="orderly-text-4xs orderly-text-base-contrast-36">
          <Text rule="date">{item.created_time}</Text>
        </div>
      </div>
      <div className="orderly-grid orderly-grid-cols-3 orderly-gap-2">
        <Statistic
          label="Qty."
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          value={item.quantity ?? "-"}
          rule="price"
          precision={base_dp}
          className={
            item.side === OrderSide.BUY
              ? "orderly-text-trade-profit"
              : "orderly-text-trade-loss"
          }
        />
        <Statistic
          label="Filled"
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
          value={item.executed ?? "-"}
          rule="price"
          precision={base_dp}
        />
        <Statistic
          label="Status"
          rule="status"
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
          value={item.status}
          align="right"
        />
        <Statistic
          label={
            <>
              <span className="orderly-text-base-contrast-36">Avg. total</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
          rule="price"
          precision={quote_dp}
          value={item.average_executed_price ?? "-"}
        />
        <Statistic
          labelClassName="orderly-text-4xs orderly-text-base-contrast-36"
          valueClassName="orderly-text-3xs orderly-text-base-contrast-80"
          label={
            <>
              <span className="orderly-text-base-contrast-36">Order price</span>
              <span className="orderly-text-base-contrast-20">(USDC)</span>
            </>
          }
          value={item.type === OrderType.MARKET ? "Market" : item.price}
        />
      </div>
    </div>
  );
};
