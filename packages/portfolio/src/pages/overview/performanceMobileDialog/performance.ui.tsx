import React from "react";
import {
  AssetLineChart,
  PnLBarChart,
  PnlLineChart,
  PnlLineChartProps,
} from "@orderly.network/chart";
import { useTranslation } from "@orderly.network/i18n";
import { Tabs, TabPanel, Flex, Text } from "@orderly.network/ui";
import {
  PeriodType,
  useAssetsHistoryDataReturn,
} from "../shared/useAssetHistory";

const responsiveProps: PnlLineChartProps["responsiveContainerProps"] = {
  width: "100%",
  minHeight: 144,
  aspect: 2.5,
};

export const PerformanceMobileUI: React.FC<useAssetsHistoryDataReturn> = (
  props,
) => {
  const { t } = useTranslation();
  const { data } = props;
  return (
    <div>
      <Tabs
        defaultValue={PeriodType.WEEK}
        classNames={{ tabsList: "oui-justify-between", trigger: "oui-w-1/3" }}
      >
        <TabPanel
          title={t("common.select.7d")}
          value={PeriodType.WEEK}
          className="oui-min-h-40"
        >
          <AssetLineChart
            data={data}
            responsiveContainerProps={responsiveProps}
          />
        </TabPanel>
        <TabPanel
          title={t("common.select.30d")}
          value={PeriodType.MONTH}
          className="oui-min-h-40"
        >
          <AssetLineChart
            data={data}
            responsiveContainerProps={responsiveProps}
          />
        </TabPanel>
        <TabPanel
          title={t("common.select.90d")}
          value={PeriodType.QUARTER}
          className="oui-min-h-40"
        >
          <AssetLineChart
            data={data}
            responsiveContainerProps={responsiveProps}
          />
        </TabPanel>
      </Tabs>
      <Flex justify="between" itemAlign="center" gap={2} my={4}>
        <Flex
          direction="column"
          itemAlign="start"
          className="oui-w-1/3 oui-rounded-lg oui-bg-base-7 oui-px-2 oui-py-1.5"
        >
          <div>{PeriodType.WEEK}</div>
          <Text.numeral rule="percentages" visible coloring>
            1
          </Text.numeral>
        </Flex>
        <Flex
          direction="column"
          itemAlign="start"
          className="oui-w-1/3 oui-rounded-lg oui-bg-base-7 oui-px-2 oui-py-1.5"
        >
          <div>{PeriodType.MONTH}</div>
          <Text.numeral visible coloring showIdentifier>
            2
          </Text.numeral>
        </Flex>
        <Flex
          direction="column"
          itemAlign="start"
          className="oui-w-1/3 oui-rounded-lg oui-bg-base-7 oui-px-2 oui-py-1.5"
        >
          <div>{PeriodType.QUARTER}</div>
          <Text.numeral visible coloring={false}>
            3
          </Text.numeral>
        </Flex>
      </Flex>
      <Tabs defaultValue={"dailyPnl"}>
        <TabPanel
          value={"dailyPnl"}
          title={t("portfolio.overview.performance.dailyPnl")}
          className="oui-min-h-40"
        >
          <PnLBarChart
            data={data}
            invisible={(data?.length ?? 0) <= 2}
            responsiveContainerProps={responsiveProps}
          />
        </TabPanel>
        <TabPanel
          value={"cumulativePnl"}
          title={t("portfolio.overview.performance.cumulativePnl")}
          className="oui-min-h-40"
        >
          <PnlLineChart
            data={data}
            invisible={(data?.length ?? 0) <= 2}
            responsiveContainerProps={responsiveProps}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};
