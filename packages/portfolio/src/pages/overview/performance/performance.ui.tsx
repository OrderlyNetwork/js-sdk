import { Card, Grid, Box, Statistic, Text } from "@orderly.network/ui";

import { UsePerformanceScriptReturn } from "./performance.script";
import { PnLBarChart, PnlLineChart } from "@orderly.network/chart";
import { PeriodTitle } from "../shared/periodHeader";
import { useMemo } from "react";

export type PerformanceUIProps = {
  // periodTypes: string[];
  // period: string;
  // onPeriodChange: (period: string) => void;
} & UsePerformanceScriptReturn;

export const PerformanceUI = (props: PerformanceUIProps) => {
  const { periodTypes, period, onPeriodChange, aggregateValue } = props;

  return (
    <Card
      // @ts-ignore
      title={
        <PeriodTitle
          onPeriodChange={onPeriodChange}
          periodTypes={periodTypes}
          period={period}
        />
      }
      id="portfolio-overview-performance"
    >
      <Grid cols={3} gap={4}>
        <Box gradient="neutral" r="md" px={4} py={2} angle={184}>
          <Statistic
            label={`${period} ROI`}
            // @ts-ignore
            valueProps={{
              rule: "percentages",
              coloring: true,
            }}
          >
            {aggregateValue.roi}
          </Statistic>
        </Box>
        <Box gradient="neutral" r="md" px={4} py={2} angle={184}>
          <Statistic
            label={`${period} PnL`}
            // @ts-ignore
            valueProps={{
              coloring: true,
              showIdentifier: true,
            }}
          >
            {aggregateValue.pnl}
          </Statistic>
        </Box>
        <Box gradient="neutral" r="md" px={4} py={2} angle={184}>
          <Statistic label={`${period} Volume (USDC)`}>
            {aggregateValue.vol}
          </Statistic>
        </Box>
      </Grid>
      <Grid cols={2} gap={4}>
        <PerformancePnL data={props.data ?? []} invisible={props.invisible} />
        <CumulativePnlChart
          data={props.data ?? []}
          invisible={props.invisible}
        />
      </Grid>
    </Card>
  );
};

export const PerformancePnL = (props: { data: any[]; invisible: boolean }) => {
  // console.log(props.data);
  const tickValues = useMemo(() => {
    if (!Array.isArray(props.data) || !props.data.length) return;
    return [props.data[0].date, props.data[props.data?.length - 1].date];
  }, [props.data]);

  return (
    <Box mt={4} height={"188px"}>
      <Text as="div" size="sm" className="oui-mb-3">
        Performance PnL
      </Text>
      <Box r="md" className="oui-border oui-border-line-4 oui-h-[188px]">
        <PnLBarChart data={props.data} invisible={props.invisible} />
      </Box>
    </Box>
  );
};

export const CumulativePnlChart = (props: {
  data: any[];
  invisible: boolean;
}) => {
  return (
    <Box mt={4}>
      <Text as="div" size="sm" className="oui-mb-3">
        Cumulative PnL
      </Text>
      <Box r="md" className="oui-border oui-border-line-4 oui-h-[188px]">
        <PnlLineChart data={props.data} invisible={props.invisible} />
        {/* <Chart data={props.data} x={"date"} y={"pnl"}>
          <Axis orientation="left" />
        </Chart> */}
      </Box>
    </Box>
  );
};
