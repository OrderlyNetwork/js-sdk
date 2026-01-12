import { Flex, cn } from "@orderly.network/ui";
import { Content } from "../../../components/content";
import { ReferralLinkWidget } from "./referralLink";
import { SummaryWidget } from "./summary";
import { TitleStatisticWidget } from "./titleStatistic";

export const AffiliatePage = () => {
  return (
    <Flex
      id="oui-affiliate-affiliate-page"
      className={cn("oui-h-lvw", "oui-font-semibold")}
      direction={"column"}
      gap={4}
    >
      <Content>
        <Flex direction={"column"} gap={10}>
          <Flex width={"100%"} itemAlign={"stretch"} gap={6}>
            <SummaryWidget />
            <ReferralLinkWidget />
          </Flex>

          <TitleStatisticWidget />
        </Flex>
      </Content>
    </Flex>
  );
};
