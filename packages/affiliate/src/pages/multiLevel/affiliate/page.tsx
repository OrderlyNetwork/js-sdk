import { useTranslation } from "@orderly.network/i18n";
import { Flex, Grid, cn, Text } from "@orderly.network/ui";
import { Content } from "../../../components/content";
import { CommissionChartWidget } from "./commissionChart";
import { MultiLevelReferralWidget } from "./multiLevelReferral";
import { ReferralInfoWidget } from "./referralInfo";
import { SummaryWidget } from "./summary";

export const MultiLevelAffiliatePage = () => {
  const { t } = useTranslation();

  return (
    <Flex
      id="oui-affiliate-affiliate-page"
      className={cn("oui-h-lvw", "oui-font-semibold", "oui-pb-24 oui-pt-16")}
      direction={"column"}
      gap={4}
    >
      <Content>
        <Flex
          width={"100%"}
          direction={"column"}
          className="oui-gap-8 md:oui-gap-10"
        >
          <Flex width={"100%"} direction={"column"} itemAlign={"start"} gap={4}>
            <Text className="oui-text-[32px] oui-leading-[40px] md:oui-text-6xl md:oui-leading-[72px]">
              {t("affiliate.earnReferralCommissions")}
            </Text>
            <Text size="sm" intensity={54}>
              {t("affiliate.earnReferralCommissions.description")}
            </Text>
          </Flex>

          <Grid
            width={"100%"}
            height={"100%"}
            gap={6}
            cols={1}
            rows={1}
            className="md:oui-grid-cols-2"
          >
            <SummaryWidget />
            <ReferralInfoWidget />
            {/* <MultiLevelReferralWidget /> */}
          </Grid>

          <CommissionChartWidget />
        </Flex>
      </Content>
    </Flex>
  );
};
