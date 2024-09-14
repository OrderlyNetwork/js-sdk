import { FC, useContext, useMemo } from "react";

import { OrderBookContext } from "../orderContext";

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
    <div className="oui-flex oui-flex-1 oui-flex-row oui-justify-between oui-text-base-contrast-36 oui-text-4xs desktop:oui-text-3xs oui-pb-2 desktop:oui-pt-2">
      <div
        id="oui-order-book-header-price"
        className="oui-flex oui-flex-col desktop:oui-flex-row desktop:oui-items-center"
      >
        <span className="desktop:oui-text-2xs">Price</span>
        <span>{`(${props.quote})`}</span>
      </div>
      <div
        className="oui-flex oui-items-center oui-cursor-pointer"
        onClick={() =>
          onModeChange?.(mode === "amount" ? "quantity" : "amount")
          
        }
      >
        <div
          id="oui-order-book-header-qty"
          className="oui-flex oui-flex-col desktop:oui-flex-row desktop:oui-items-center oui-text-base-contrast-36 oui-text-4xs oui-items-end oui-mr-1"
        >
          <span className="desktop:oui-text-2xs">{qtyLabel}</span>
          <span>{`(${currency})`}</span>
        </div>
      </div>
    </div>
  );
};

