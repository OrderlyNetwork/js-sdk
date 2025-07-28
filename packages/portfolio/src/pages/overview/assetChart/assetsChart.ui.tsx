import { AssetLineChart } from "@orderly.network/chart";
import { useTranslation } from "@orderly.network/i18n";
import { Card } from "@orderly.network/ui";
import { PeriodTitle } from "../shared/periodHeader";
import { useAssetsChartScriptReturn } from "./assetsChart.script";

export type AssetsLineChartProps = {} & useAssetsChartScriptReturn;

export const AssetsChart = (props: AssetsLineChartProps) => {
  const { onPeriodChange, periodTypes, period } = props;
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
      <AssetLineChart data={props.data as any} invisible={props.invisible} />
      {/* <PnlLineChart data={data} /> */}
      {/* <LineChart data={data} /> */}
    </Card>
  );
};
