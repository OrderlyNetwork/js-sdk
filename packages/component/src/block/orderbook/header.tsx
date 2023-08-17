import { FC, useContext, useMemo } from "react";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import { QtyMode } from "./types";
import { OrderBookContext } from "./orderContext";

interface Props {
  priceUnit: string;
  qtyUnit: string;
  // onModeChange?: (mode: QtyMode) => void;
}

export const Header: FC<Props> = (props) => {
  const { mode, onModeChange } = useContext(OrderBookContext);
  const currency = useMemo(() => {
    if (mode === "amount") {
      return props.priceUnit;
    }
    return props.qtyUnit;
  }, [mode]);
  return (
    <div className="flex flex-row justify-between text-tertiary text-sm pb-1">
      <div className={"flex flex-col"}>
        <span>Price</span>
        <span>{`(${props.priceUnit})`}</span>
      </div>
      <div
        className={"flex items-center cursor-pointer"}
        onClick={() =>
          onModeChange?.(mode === "amount" ? "quantity" : "amount")
        }
      >
        <div className={"flex flex-col items-end"}>
          <span>Qty</span>
          <span>{`(${currency})`}</span>
        </div>
        <TriangleDownIcon />
      </div>
    </div>
  );
};
