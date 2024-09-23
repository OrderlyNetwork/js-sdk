import { FC, useContext, useMemo } from "react";
import { OrderBookCell } from "./cell";
import { OrderBookContext, useOrderBookContext } from "../orderContext";
import { OrderBookCellType } from "../types";
import { Box } from "@orderly.network/ui";

interface OrderBookListProps {
  type: OrderBookCellType;
  data: number[][];
  countQty: number;
}

export const ListBox: FC<OrderBookListProps> = (props) => {
  const { data } = props;
  const { mode } = useOrderBookContext();

  return (
    <Box
      id="oui-order-book-list"
      className="oui-flex oui-flex-col oui-gap-[1px] oui-w-full"
    >
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
    </Box>
  );
};
