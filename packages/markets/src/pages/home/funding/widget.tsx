import { FundingUI } from "./funding.ui";
import { useFundingScript } from "./funding.script";

export const FundingWidget = () => {
  const state = useFundingScript();
  return <FundingUI {...state} />;
};
