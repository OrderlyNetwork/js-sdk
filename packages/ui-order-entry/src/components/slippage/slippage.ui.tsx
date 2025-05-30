import { SlippageCell } from "./components/slippageCell";

export const SlippageUI = (props: {
  slippage: string;
  setSlippage: (slippage: string) => void;
}) => {
  return <SlippageCell {...props} />;
};
