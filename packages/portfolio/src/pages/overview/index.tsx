import { Grid } from "@orderly.network/ui";
import { Assets } from "./assets";
import { Performance } from "./performance";

export const OverviewPage = () => {
  return (
    <Grid cols={2}>
      <Assets />
      <Assets />
      <Grid.span colSpan={2}>
        <Performance />
      </Grid.span>
      <Grid.span colSpan={2}>
        <Assets />
      </Grid.span>
    </Grid>
  );
};
