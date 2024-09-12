import { Box } from "@orderly.network/ui";
import { BasicSymbolInfo } from "../../../types/types";
import { OrderBookCellType } from "../types";
import { DesktopListBox } from "./listBox.desktop";
import { FC, useMemo } from "react";
import { useOrderBookContext } from "../orderContext";
export interface Props {
  data: number[][];
}
export const DesktopAsks: FC<Props> = (props) => {
  const { data } = props;
  const countQty = useMemo(() => {
    let max = Number.NaN;
    let len = data.length;
    let index = 0;

    while (Number.isNaN(max) && index < len) {
      max = data[index][2];
      index++;
    }

    return max;
  }, [data]);
  
  return (
    <DesktopListBox type={OrderBookCellType.ASK} data={data} countQty={countQty} />
  );
};
