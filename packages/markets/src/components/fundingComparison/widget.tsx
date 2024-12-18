import { FC } from "react";
import { FundingComparison } from "./fundingComparison.ui";
import { useFundingComparisonScript } from "./fundingComparison.script";

export const FundingComparisonWidget: FC = () => {
  const state = useFundingComparisonScript();
  return <FundingComparison {...state} />;
};
