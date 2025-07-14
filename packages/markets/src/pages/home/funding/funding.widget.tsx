import { useScreen } from "@orderly.network/ui";
import { MobileFunding } from "./funding.mobile.ui";
import { useFundingScript } from "./funding.script";
import { Funding } from "./funding.ui";

export const FundingWidget = () => {
  const state = useFundingScript();
  const { isMobile } = useScreen();
  return isMobile ? <MobileFunding {...state} /> : <Funding {...state} />;
};
