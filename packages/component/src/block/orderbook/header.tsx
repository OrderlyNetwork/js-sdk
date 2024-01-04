import { FC, useContext, useMemo } from "react";

import { OrderBookContext } from "./orderContext";

import { SwitchIcon } from "@/icon";

interface Props {
  quote: string;
  base: string;
  // onModeChange?: (mode: QtyMode) => void;
}

export const Header: FC<Props> = (props) => {
  const { totalMode, onTotalModeChange, showTotal } = useContext(OrderBookContext);

  if (showTotal == false) {
    return (<MobileHeader base={props.base} quote={props.quote} />);
  }

  const currency = useMemo(() => {
    if (totalMode === "amount") {
      return props.quote;
    }
    return props.base;
  }, [totalMode, props.quote, props.base]);

  return (
    <div className="orderly-flex orderly-flex-row orderly-justify-between orderly-text-base-contrast-36 orderly-gap-2 orderly-text-4xs desktop:orderly-text-3xs">
      <MobileHeader base={props.base} quote={props.quote} />
      {showTotal && (<div
        id="orderly-order-book-header-price"
        className="orderly-flex orderly-flex-[0.7] orderly-pl-2 orderly-flex-col orderly-cursor-pointer desktop:orderly-flex-row desktop:orderly-items-center"
        onClick={() => {
          onTotalModeChange?.(totalMode === "amount" ? "quantity" : "amount")
        }}
      >
        <span className="desktop:orderly-text-2xs">Total</span>
        <span className="orderly-pr-1">{`(${currency})`}</span>
        <SwitchIcon size={8} />
      </div>)}
    </div>
  );
};


const MobileHeader: FC<Props> = (props) => {

  const { mode, onModeChange, showTotal } = useContext(OrderBookContext);
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
    <div className="orderly-flex orderly-flex-1 orderly-flex-row orderly-justify-between orderly-text-base-contrast-36 orderly-text-4xs desktop:orderly-text-3xs orderly-pb-2 desktop:orderly-pt-2">
      <div
        id="orderly-order-book-header-price"
        className="orderly-flex orderly-flex-col desktop:orderly-flex-row desktop:orderly-items-center"
      >
        <span className="desktop:orderly-text-2xs">Price</span>
        <span>{`(${props.quote})`}</span>
      </div>
      <div
        className="orderly-flex orderly-items-center orderly-cursor-pointer"
        onClick={!showTotal ? () =>
          onModeChange?.(mode === "amount" ? "quantity" : "amount")
          : undefined
        }
      >
        <div
          id="orderly-order-book-header-qty"
          className="orderly-flex orderly-flex-col desktop:orderly-flex-row desktop:orderly-items-center orderly-text-base-contrast-36 orderly-text-4xs orderly-items-end orderly-mr-1"
        >
          <span className="desktop:orderly-text-2xs">{qtyLabel}</span>
          <span>{`(${currency})`}</span>
        </div>
        {!showTotal && (<SwitchIcon size={8} />)}
      </div>
    </div>
  );
}