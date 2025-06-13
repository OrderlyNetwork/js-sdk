import { FC } from "react";
import { useFundingOverviewScript } from "./fundingOverview.script";
import { FundingOverview } from "./fundingOverview.ui";

export const FundingOverviewWidget: FC = () => {
  const props = useFundingOverviewScript();
  return <FundingOverview {...props} />;
};
