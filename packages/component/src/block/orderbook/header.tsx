import { FC, useContext, useMemo } from "react";

import { OrderBookContext } from "./orderContext";

import { SwitchIcon } from "@/icon";

interface Props {
  quote: string;
  base: string;
  // onModeChange?: (mode: QtyMode) => void;
}

export const Header: FC<Props> = (props) => {
  const { mode, onModeChange } = useContext(OrderBookContext);
  const currency = useMemo(() => {
    if (mode === "amount") {
      return props.quote;
    }
    return props.base;
  }, [mode, props.quote, props.base]);

  const qtyLabel = useMemo(() => {
    return mode === "amount" ? "Value" : "Qty";
  }, [mode]);

  return (
    <div className="flex flex-row justify-between text-base-contrast-36 text-4xs pb-2">
      <div className={"flex flex-col"}>
        <span>Price</span>
        <span>{`(${props.quote})`}</span>
      </div>
      <div
        className={"flex items-center cursor-pointer"}
        onClick={() =>
          onModeChange?.(mode === "amount" ? "quantity" : "amount")
        }
      >
        <div className={"flex flex-col text-base-contrast-36 text-4xs items-end mr-1"}>
          <span>{qtyLabel}</span>
          <span>{`(${currency})`}</span>
        </div>
        <SwitchIcon size={8} />
      </div>
    </div>
  );
};
