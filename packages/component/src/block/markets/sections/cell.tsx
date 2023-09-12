import { NetworkImage } from "@/icon";
import { SymbolContext } from "@/provider";
import { Numeral, Text } from "@/text";
import { API } from "@orderly.network/types";
import { FC, useContext } from "react";

export interface MarketCellProps {
  item: API.MarketInfoExt;
}

export const Cell: FC<MarketCellProps> = (props) => {
  const { item } = props;
  const { base_dp } = useContext(SymbolContext);
  return (
    <div className="flex items-center gap-2 cursor-pointer ">
      <NetworkImage type={"symbol"} symbol={item.symbol} />
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <Text rule="symbol">{item.symbol}</Text>
          <Numeral coloring precision={base_dp}>
            {item["24h_close"]}
          </Numeral>
        </div>
        <div className="flex items-center justify-between">
          <Numeral rule="human" className="text-sm text-base-contrast/50">
            {item["24h_volumn"]}
          </Numeral>
          <Numeral rule="percentages" className="text-sm" coloring>
            {item.change}
          </Numeral>
        </div>
      </div>
    </div>
  );
};
