import { OrderBookCell, OrderBookCellType } from "./cell";
import { ListBox } from "./listBox";
import { FC } from "react";

export interface Props {
  data: any[];
}
export const Bids: FC<Props> = () => {
  return <ListBox type={OrderBookCellType.BID} />;
};
