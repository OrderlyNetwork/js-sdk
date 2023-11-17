import { FC, useContext, useMemo } from "react";
import { OrderBookCell, OrderBookCellType } from "./cell";
import { OrderBookContext } from "./orderContext";

interface OrderBookListProps {
  type: OrderBookCellType;
  data: number[][];
  countQty: number;
}

export const ListBox: FC<OrderBookListProps> = (props) => {
  const { data } = props;
  const { mode } = useContext(OrderBookContext);

  return (
    <div className="orderly-flex orderly-flex-col orderly-gap-[1px]">
      {data.map((item, index) => {
        return (
          <OrderBookCell
            key={index}
            background={""}
            price={item[0]}
            quantity={item[1]}
            accumulated={item[2]}
            count={props.countQty}
            type={props.type}
            mode={mode}
          />
        );
      })}
      {/*<OrderBookCell*/}
      {/*  background={""}*/}
      {/*  price={"0.00"}*/}
      {/*  quantity={"0.00"}*/}
      {/*  size={30}*/}
      {/*/>*/}
    </div>
  );
};
