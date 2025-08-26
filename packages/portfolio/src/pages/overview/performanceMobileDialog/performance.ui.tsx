import React from "react";
import {
  AssetLineChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  PnLBarChart,
  PnlLineChart,
} from "@orderly.network/chart";
import { useTranslation } from "@orderly.network/i18n";
import { EMPTY_LIST } from "@orderly.network/types";
import { Tabs, TabPanel } from "@orderly.network/ui";
import {
  PeriodType,
  useAssetsHistoryDataReturn,
} from "../shared/useAssetHistory";

export const PerformanceMobileUI: React.FC<useAssetsHistoryDataReturn> = (
  props,
) => {
  const { t } = useTranslation();
  const { data } = props;
  return (
    <div>
      <Tabs
        defaultValue={PeriodType.WEEK}
        classNames={{
          tabsList: "oui-justify-between",
          trigger: "oui-max-w-full oui-w-full",
        }}
      >
        <TabPanel
          title={t("common.select.7d")}
          value={PeriodType.WEEK}
          className="oui-min-h-40"
        >
          <AssetLineChart
            data={data}
            responsiveContainerProps={{
              width: "100%",
              minHeight: 144,
              aspect: 2.5,
            }}
          />
        </TabPanel>
        <TabPanel
          title={t("common.select.30d")}
          value={PeriodType.MONTH}
          className="oui-min-h-40"
        >
          <AssetLineChart
            data={data}
            responsiveContainerProps={{
              width: "100%",
              minHeight: 144,
              aspect: 2.5,
            }}
          />
        </TabPanel>
        <TabPanel
          title={t("common.select.90d")}
          value={PeriodType.QUARTER}
          className="oui-min-h-40"
        >
          <AssetLineChart
            data={data}
            responsiveContainerProps={{
              width: "100%",
              minHeight: 144,
              aspect: 2.5,
            }}
          />
        </TabPanel>
      </Tabs>
      <Tabs defaultValue={"dailyPnl"}>
        <TabPanel
          value={"dailyPnl"}
          title={t("portfolio.overview.performance.dailyPnl")}
          className="oui-min-h-40"
        >
          <PnLBarChart
            data={data}
            invisible={(data?.length ?? 0) <= 2}
            responsiveContainerProps={{
              width: "100%",
              minHeight: 144,
              aspect: 2.5,
            }}
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
            responsiveContainerProps={{
              width: "100%",
              minHeight: 144,
              aspect: 2.5,
            }}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};
