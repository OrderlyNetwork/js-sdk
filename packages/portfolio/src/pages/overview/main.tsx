import { Grid } from "@orderly.network/ui";
import { Performance } from "./performance";
import { AssetsChart } from "./assetsChart";
import { HistoryDataPanel } from "./historyDataPanel";
import { Assets } from "./assets";

export const OverviewPage = () => {
  return (
    <Grid cols={2}>
      <Assets />
      <AssetsChart />
      <Grid.span colSpan={2}>
        <Performance />
      </Grid.span>
      <Grid.span colSpan={2}>
        <HistoryDataPanel />
      </Grid.span>
    </Grid>
  );
};
