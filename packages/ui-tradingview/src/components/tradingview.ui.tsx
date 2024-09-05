import React, { useRef } from "react";
import { TradingviewUIPropsInterface } from "../type";

export function TradingviewUi(props: TradingviewUIPropsInterface) {
  const { chartRef } = props;
  return (
    <div className="oui-h-full oui-w-full oui-min-h-[350px]">
      <div className="oui-h-full oui-w-full" ref={chartRef}></div>
    </div>
  );
}
