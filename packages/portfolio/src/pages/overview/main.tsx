import { Grid, useScreen } from "@orderly.network/ui";
import { AssetsChartWidget } from "./assetChart";
import { AssetWidget } from "./assets";
import { HistoryDataGroupWidget } from "./historyDataGroup";
import { MobileOverview } from "./mobile";
import { PerformanceWidget } from "./performance";
import { OverviewContextProvider } from "./providers/overviewCtx";

export const OverviewPage = () => {
  const { isMobile } = useScreen();
  return (
    <OverviewContextProvider>
      {isMobile ? (
        <MobileOverview />
      ) : (
        <Grid cols={2} gap={4}>
          <AssetWidget />
          <AssetsChartWidget />
          <Grid.span colSpan={2}>
            <PerformanceWidget />
          </Grid.span>
          <Grid.span colSpan={2}>
            <HistoryDataGroupWidget />
          </Grid.span>
        </Grid>
      )}
    </OverviewContextProvider>
  );
};
