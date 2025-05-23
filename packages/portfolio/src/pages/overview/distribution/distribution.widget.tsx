import { DistributionHistoryMobile } from "./distribution.ui.mobile";
import { DistributionHistoryDesktop } from "./distribution.ui";
import { useDistributionHistoryHook } from "./useDataSource.script";
import { useScreen } from "@orderly.network/ui";

export const DistributionHistoryWidget = () => {
  const state = useDistributionHistoryHook();
  const { isMobile } = useScreen();
  if (isMobile) {
    return <DistributionHistoryMobile {...state} />;
  }
  return <DistributionHistoryDesktop {...state} />;
};
