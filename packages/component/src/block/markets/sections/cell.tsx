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


  return (
    <div
      className="orderly-flex orderly-items-center orderly-gap-2 orderly-cursor-pointer"
      onClick={() => onItemClick?.(item)}
    >
      <NetworkImage type={"symbol"} symbol={item.symbol} />
      <div className="orderly-flex orderly-flex-1 orderly-flex-col">
        <div className="orderly-flex orderly-items-center orderly-justify-between orderly-text-2xs">
          <Text rule="symbol" className="orderly-text-base-contrast">{item.symbol}</Text>
          <Numeral precision={quote_dp} className="orderly-text-base-contrast">
            {item["24h_close"]}
          </Numeral>
        </div>
        <div className="orderly-flex orderly-items-center orderly-justify-between orderly-text-4xs">
          {/* <Numeral.total
            rule="human"
            className="orderly-text-base-contrast-54"
            price={item["24h_close"]}
            quantity={item["24h_volume"]}
          /> */}
          <Numeral rule="human" className="orderly-text-base-contrast-54">
            {item?.["24h_amount"]}
          </Numeral>
          <Numeral rule="percentages" coloring>
            {item.change}
          </Numeral>
        </div>
      </div>
    </div>
  );
};
