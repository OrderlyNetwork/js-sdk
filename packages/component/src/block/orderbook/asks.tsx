import { OrderBookCell, OrderBookCellType } from "./cell";
import { ListBox } from "./listBox";
import { FC } from "react";
export interface Props {
  data: any[];
}
export const Asks: FC<Props> = () => {
  return <ListBox type={OrderBookCellType.ASK} />;
};
