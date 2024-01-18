import { FC, useContext, useMemo } from "react";
import { DesktopOrderBookCell } from "./cell.desktop";
import { OrderBookContext } from "../orderContext";
import { OrderBookCellType } from "../types";

interface DesktopListBoxProps {
  type: OrderBookCellType;
  data: number[][];
  countQty: number;
}

export const DesktopListBox: FC<DesktopListBoxProps> = (props) => {
  const { data } = props;
  const { mode } = useContext(OrderBookContext);

  return (
    <div
      id="orderly-order-book-list"
      className="orderly-flex orderly-flex-col orderly-gap-[1px]"
    >
      {data.map((item, index) => {
        return (
          <DesktopOrderBookCell
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
    </div>
  );
};
