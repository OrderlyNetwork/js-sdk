import { FC } from "react";
import { OrderBookCell, OrderBookCellType } from "./cell";

interface OrderBookListProps {
  type: OrderBookCellType;
}

export const ListBox: FC<OrderBookListProps> = (props) => {
  return (
    <div className="flex flex-col gap-[1px]">
      <OrderBookCell
        background={""}
        price={"0.00"}
        quantity={"0.00"}
        size={30}
      />
      <OrderBookCell
        background={""}
        price={"0.00"}
        quantity={"0.00"}
        size={20}
      />
    </div>
  );
};
