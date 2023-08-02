import { FC } from "react";
import { TriangleDownIcon } from "@radix-ui/react-icons";

export type QtyMode = "quantity" | "amount";

interface Props {
  priceUnit: string;
  qtyUnit: string;
  onModeChange?: (mode: QtyMode) => void;
}

export const Header: FC<Props> = (props) => {
  return (
    <div className="flex flex-row justify-between">
      <div className={"flex flex-col"}>
        <span>Price</span>
        <span>{`(${props.priceUnit})`}</span>
      </div>
      <div className={"flex items-center"}>
        <div className={"flex flex-col items-end"}>
          <span>Qty</span>
          <span>{`(${props.qtyUnit})`}</span>
        </div>
        <TriangleDownIcon />
      </div>
    </div>
  );
};
