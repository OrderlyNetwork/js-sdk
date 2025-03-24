import { Card } from "@orderly.network/ui";
import { PeriodTitle } from "../shared/periodHeader";
import { useAssetsLineChartScriptReturn } from "./assetsChart.script";
import { AssetLineChart } from "@orderly.network/chart";
import { useTranslation } from "@orderly.network/i18n";

export type AssetsLineChartProps = {} & useAssetsLineChartScriptReturn;

export const AssetsChartUI = (props: AssetsLineChartProps) => {
  const { onPeriodChange, periodTypes, period, data } = props;
  const { t } = useTranslation();

  return (
    <Card
      title={
        <PeriodTitle
          onPeriodChange={onPeriodChange}
          periodTypes={periodTypes}
          period={period}
          title={t("common.assets")}
        />
      }
      id="portfolio-overview-assets-chart"
      classNames={{
        content: "oui-h-[168px] oui-pb-0",
      }}
    >
      <AssetLineChart data={props.data} invisible={props.invisible} />
      {/* <PnlLineChart data={data} /> */}
      {/* <LineChart data={data} /> */}
    </Card>
  );
};
