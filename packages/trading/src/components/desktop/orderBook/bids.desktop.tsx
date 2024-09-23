import { OrderBookCellType } from "../../base/orderBook/types";
import { DesktopListBox } from "./listBox.desktop";
import { FC, useMemo } from "react";

export interface Props {
  data: any[];
}
export const DesktopBids: FC<Props> = (props) => {
  const { data } = props;
  const countQty = useMemo(() => {
    let max = Number.NaN;
    // let len = data.length;
    let index = data.length - 1;

    while (Number.isNaN(max) && index > 0) {
      max = data[index][2];
      index--;
    }

    return max;
    // return data.length > 0 ? data[data.length - 1][2] : 0;
  }, [data]);
  return (
    <DesktopListBox type={OrderBookCellType.BID} data={data} countQty={countQty} />
  );
};
