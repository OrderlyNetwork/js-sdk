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
    <div className="p-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 flex items-center">
          {typeTag}
          <div className="px-2" onClick={onSymbol}>
            <Text rule="symbol">{item.symbol}</Text>
          </div>
        </div>
        <div className={"text-sm text-base-contrast/30"}>
          <Text rule="date">{item.created_time}</Text>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Statistic
          label="Qty."
          value={item.quantity ?? "-"}
          rule="price"
          precision={base_dp}
          className={
            item.side === OrderSide.BUY
              ? "text-trade-profit"
              : "text-trade-loss"
          }
        />
        <Statistic
          label="Filled"
          value={item.executed ?? "-"}
          rule="price"
          precision={base_dp}
        />
        <Statistic
          label="Status"
          rule="status"
          value={item.status}
          align="right"
        />
        <Statistic
          label="Avg. price(USDC)"
          rule="price"
          precision={quote_dp}
          value={item.average_executed_price ?? "-"}
        />
        <Statistic
          label="Order price(USDC)"
          value={item.type === OrderType.MARKET ? "Market" : item.price}
        />
      </div>
    </div>
  );
};
