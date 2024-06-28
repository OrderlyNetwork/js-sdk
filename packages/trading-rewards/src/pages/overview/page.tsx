import { Flex, cn } from "@orderly.network/ui";
import { TitleWidget } from "./title/title.widget";
import { CurEpochWidget } from "./curEpoch";
import { AvailableToClaimWidget } from "./availableToClaim";
import { StakeBoosterWidget } from "./stakeBooster";

export const OverviewPage = () => {
  return (
    <Flex
      className={cn(
        "oui-h-lvw oui-w-lvw",
        // padding
        "oui-p-4 lg:oui-p-6 xl:oui-p-3"
      )}
      direction={"column"}
      gap={4}
    >
      <TitleWidget />
      <CurEpochWidget />
      <AvailableToClaimWidget />
      <StakeBoosterWidget />
    </Flex>
  );
};
