import { Grid } from "@orderly.network/ui";
import { PerformanceWidget } from "./performance";
import { AssetsChartWidget } from "./assetChart/assetsChart.widget";
import { HistoryDataPanel } from "./historyDataPanel";
import { AssetWidget } from "./assets/assets.widget";

export const OverviewPage = () => {
  return (
    <Grid cols={2}>
      <AssetWidget />
      <AssetsChartWidget />
      <Grid.span colSpan={2}>
        <PerformanceWidget />
      </Grid.span>
      <Grid.span colSpan={2}>
        <HistoryDataPanel />
      </Grid.span>
    </Grid>
  );
};
