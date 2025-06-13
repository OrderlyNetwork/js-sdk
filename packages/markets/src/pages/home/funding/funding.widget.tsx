import { useFundingScript } from "./funding.script";
import { FundingUI } from "./funding.ui";

export const FundingWidget = () => {
  const state = useFundingScript();
  return <FundingUI {...state} />;
};
