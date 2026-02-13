import { useTranslation } from "@orderly.network/i18n";
import { Flex, Grid, cn, Text } from "@orderly.network/ui";
import { useReferralContext } from "../../../provider";
import { CommissionChartWidget } from "./commissionChart";
import { MultiLevelReferralWidget } from "./multiLevelReferral";
import { ReferralInfoWidget } from "./referralInfo";
import { ReferrerTableWidget } from "./referrerTable/referrerTable.widget";
import { SummaryWidget } from "./summary";

export const MultiLevelAffiliatePage = () => {
  const { t } = useTranslation();

  const { multiLevelRebateInfo } = useReferralContext();

  return (
    <Flex
      id="oui-affiliate-affiliate-page"
      className={cn("oui-h-lvw", "oui-font-semibold", "oui-pb-24 oui-pt-16")}
      direction={"column"}
      gap={4}
    >
      <div className="oui-w-full oui-px-5 md:oui-mx-auto md:oui-max-w-[1040px]">
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
            <div className="oui-order-2 md:oui-order-1">
              <SummaryWidget />
            </div>
            <div className="oui-order-1 md:oui-order-2">
              {multiLevelRebateInfo?.referral_code ? (
                <ReferralInfoWidget />
              ) : (
                <MultiLevelReferralWidget />
              )}
            </div>
          </Grid>

          <CommissionChartWidget />

          <ReferrerTableWidget />
        </Flex>
      </div>
    </Flex>
  );
};
