import { FC } from "react";
import { FundingOverview } from "./fundingOverview.ui";
import { useFundingOverviewScript } from "./fundingOverview.script";

export const FundingOverviewWidget: FC = () => {
  const props = useFundingOverviewScript();
  return <FundingOverview {...props} />;
};
