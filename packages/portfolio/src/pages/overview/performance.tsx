import { Card, Grid, Box, Statistic } from "@orderly.network/ui";
import { PerformancePnL } from "./performancePnL";

export const Performance = () => {
  return (
    <Card title="Performance" id="portfolio-overview-performance">
      <Grid cols={3}>
        <Box gradient="neutral" r="md" px={4} py={2} angle={184}>
          <Statistic
            label="30D ROI"
            valueProps={{
              rule: "percentages",
              coloring: true,
            }}
          >
            0.1678
          </Statistic>
        </Box>
        <Box gradient="neutral" r="md" px={4} py={2} angle={184}>
          <Statistic
            label="30D PnL"
            valueProps={{
              coloring: true,
              showIdentifier: true,
            }}
          >
            12345.323
          </Statistic>
        </Box>
        <Box gradient="neutral" r="md" px={4} py={2} angle={184}>
          <Statistic label="30D Volume (USDC)">1234456.778</Statistic>
        </Box>
      </Grid>
      <Grid cols={2}>
        <PerformancePnL />
      </Grid>
    </Card>
  );
};
