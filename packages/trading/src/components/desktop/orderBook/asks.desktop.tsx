import { FC, useMemo } from "react";
import { injectable } from "@orderly.network/ui";
import { OrderBookCellType } from "../../base/orderBook/types";
import { DesktopListBox } from "./listBox.desktop";

export interface Props {
  data: number[][];
}

export const DesktopAsks: FC<Props> = (props) => {
  const { data } = props;
  const countQty = useMemo(() => {
    let max = Number.NaN;
    const len = data.length;
    let index = 0;

    while (Number.isNaN(max) && index < len) {
      max = data[index][2];
      index++;
    }

    return max;
  }, [data]);

  return (
    <DesktopListBox
      type={OrderBookCellType.ASK}
      data={data}
      countQty={countQty}
    />
  );
};

export const InjectableDesktopAsks = injectable<Props>(
  DesktopAsks,
  "OrderBook.Desktop.Asks",
);
