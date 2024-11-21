import { useFundingRateScript } from "./fundingRate.script";
import { FundingRate } from "./fundingRate.ui";

export const FundingRateWidget = (props: { symbol: string }) => {
  const state = useFundingRateScript(props.symbol);
  return <FundingRate {...state} />;
};
