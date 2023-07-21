import { OrderBookCell, OrderBookCellType } from "./cell";
import { ListBox } from "./listBox";

export const Bids = () => {
  return <ListBox type={OrderBookCellType.BID} />;
};
