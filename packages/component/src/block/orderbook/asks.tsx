import { OrderBookCell, OrderBookCellType } from "./cell";
import { ListBox } from "./listBox";

export const Asks = () => {
  return <ListBox type={OrderBookCellType.ASK} />;
};
