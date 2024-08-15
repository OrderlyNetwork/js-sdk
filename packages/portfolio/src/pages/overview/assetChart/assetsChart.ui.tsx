import { Card } from "@orderly.network/ui";
import { PeriodTitle } from "../shared/periodHeader";
import { useAssetsLineChartScriptReturn } from "./assetsChart.script";
import { AssetLineChart } from "@orderly.network/chart";

export type AssetsLineChartProps = {} & useAssetsLineChartScriptReturn;

export const AssetsChartUI = (props: AssetsLineChartProps) => {
  const { onPeriodChange, periodTypes, period, data } = props;

  return (
    <Card
      title={
        <PeriodTitle
          onPeriodChange={onPeriodChange}
          periodTypes={periodTypes}
          period={period}
          title="Assets"
        />
      }
      id="portfolio-overview-assets-chart"
      classNames={{
        content: "oui-h-[150px] oui-pb-0",
      }}
    >
      <AssetLineChart data={props.data} invisible={props.invisible} />
      {/* <PnlLineChart data={data} /> */}
      {/* <LineChart data={data} /> */}
    </Card>
  );
};

// export const LineChart = (props: { data: any[] }) => {
//   return (
//     <Chart data={props.data} x={"date"} y={"pnl"}>
//       <Axis orientation="left" />
//       <Axis orientation="bottom" />
//       <Line dataKey="account_value" />
//     </Chart>
//   );
// };
