import React from "react";
import type { TradingviewUIPropsInterface } from "../type";

export const TradingviewChart: React.FC<
  React.PropsWithChildren<TradingviewUIPropsInterface>
> = ({ chartRef }) => {
  return (
    <div
      data-testid="tradingview-chart"
      ref={chartRef}
      className="oui-size-full oui-overflow-hidden"
    />
  );
};
