import React from "react";
import { SlippageCell } from "./components/slippageCell";

export interface SlippageProps {
  slippage: string;
  setSlippage?: (slippage: string) => void;
}

export const SlippageUI: React.FC<SlippageProps> = (props) => {
  return <SlippageCell {...props} />;
};
