import { NetworkImage } from "@/icon";
import { SymbolContext } from "@/provider";
import { Numeral, Text } from "@/text";
import { API } from "@orderly.network/types";
import { FC, useContext, useMemo } from "react";

export interface MarketCellProps {
  item: API.MarketInfoExt;
  onItemClick?: (item: API.MarketInfoExt) => void;
}

export const Cell: FC<MarketCellProps> = (props) => {
  const { item, onItemClick } = props;
  const { quote_dp } = useContext(SymbolContext);

  const colorClassName = useMemo(() => {
    if (!item["24h_open"] || !item["24h_close"]) {
      return "text-base-contrast/50";
    }

    if (item["24h_close"] > item["24h_open"]) {
      return "text-trade-profit";
    }

    if (item["24h_close"] < item["24h_open"]) {
      return "text-trade-loss";
    }

    return "text-base-contrast/50";
  }, [item["24h_open"], item["24h_close"]]);

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => onItemClick?.(item)}
    >
      <NetworkImage type={"symbol"} symbol={item.symbol} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <Text rule="symbol">{item.symbol}</Text>
          <Numeral precision={quote_dp} className={colorClassName}>
            {item["24h_close"]}
          </Numeral>
        </div>
        <div className="flex items-center justify-between">
          <Numeral.total
            rule="human"
            className="text-3xs text-base-contrast/50"
            price={item["24h_close"]}
            quantity={item["24h_volumn"]}
          />
          <Numeral rule="percentages" className="text-3xs" coloring>
            {item.change}
          </Numeral>
        </div>
      </div>
    </div>
  );
};
