import { FC } from "react";
import { useFundingComparisonScript } from "./fundingComparison.script";
import { FundingComparison } from "./fundingComparison.ui";

export const FundingComparisonWidget: FC = () => {
  const state = useFundingComparisonScript();
  return <FundingComparison {...state} />;
};
