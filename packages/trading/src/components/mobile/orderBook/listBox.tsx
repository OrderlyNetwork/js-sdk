import { FC } from "react";
import { OrderBookCell } from "./cell";
import { useOrderBookContext } from "../../base/orderBook/orderContext";
import { OrderBookCellType } from "../../base/orderBook/types";
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
      className="oui-order-book-list oui-flex oui-flex-col oui-gap-[1px] oui-w-full"
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
