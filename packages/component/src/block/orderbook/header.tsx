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
    <div className="orderly-flex orderly-flex-row orderly-justify-between orderly-text-base-contrast-36 orderly-text-4xs desktop:orderly-text-3xs orderly-pb-2 desktop:orderly-pt-2">
      <div className="orderly-flex orderly-flex-col desktop:orderly-flex-row desktop:orderly-items-center">
        <span>Price</span>
        <span>{`(${props.quote})`}</span>
      </div>
      <div
        className="orderly-flex orderly-items-center orderly-cursor-pointer"
        onClick={() =>
          onModeChange?.(mode === "amount" ? "quantity" : "amount")
        }
      >
        <div className="orderly-flex orderly-flex-col desktop:orderly-flex-row desktop:orderly-items-center orderly-text-base-contrast-36 orderly-text-4xs orderly-items-end orderly-mr-1">
          <span>{qtyLabel}</span>
          <span>{`(${currency})`}</span>
        </div>
        <SwitchIcon size={8} />
      </div>
    </div>
  );
};
