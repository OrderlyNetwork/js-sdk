import { Flex, Box, cn } from "@orderly.network/ui";
import { SummaryWidget } from "./summary";
import { TitleStatisticWidget } from "./titleStatistic";
import { RebatesWidget } from "./rebates";
export const TraderPage = () => {
  return (
    <Flex
        className={cn(
          "oui-h-lvw oui-w-lvw",
          // padding
          "oui-p-4 lg:oui-p-6 xl:oui-p-3",
          "oui-font-semibold"
        )}
        direction={"column"}
        gap={4}
      >
        <Flex
          width={"100%"}
          gap={4}
          className="oui-flex oui-flex-col xl:oui-flex-row"
        >
          <SummaryWidget />
          <TitleStatisticWidget />
        </Flex>
        <RebatesWidget />
      </Flex>
  );
};
